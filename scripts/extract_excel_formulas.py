#!/usr/bin/env python3
"""
extract_excel_formulas.py
========================
Comprehensive Excel formula extraction tool for VirtualLab Analisis Kimia.

This script:
1. Parses all workbooks (Proksimat & Volumetri)
2. Reads all worksheets
3. Reads all cells with formulas
4. Identifies inputs, intermediate calculations, outputs
5. Identifies lookup tables
6. Identifies units
7. Identifies formula alternatives
8. Identifies inter-cell dependencies
9. Outputs structured JSON to docs/excel-formulas.json
"""

import json
import os
import re
import sys
from collections import defaultdict
from typing import Any, Dict, List, Optional, Tuple

import openpyxl
from openpyxl.utils import get_column_letter, column_index_from_string


WORKBOOK_FILES = [
    "Format Analisis Proksimat-a adam.xlsx",
    "Format Analisis Volumetri-Perhitungan.xlsx",
]

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOCS_DIR = os.path.join(BASE_DIR, "docs")


def extract_cell_references(formula: str) -> List[str]:
    """Extract all cell references from a formula (e.g., H19, H20, $A$1, Sheet1!A1)."""
    if not formula or not formula.startswith("="):
        return []
    # Match cell refs like A1, $A$1, A$1, $A1, Sheet!A1, 'Sheet Name'!A1
    pattern = r"(?:'[^']*'!|[A-Za-z_][A-Za-z0-9_]*!)?(\$?[A-Z]{1,3}\$?\d{1,7})"
    refs = re.findall(pattern, formula.upper())
    # Also match full cross-sheet references
    full_pattern = r"(?:'([^']*)'!|([A-Za-z_][A-Za-z0-9_]*)!)(\$?[A-Z]{1,3}\$?\d{1,7})"
    cross_refs = re.findall(full_pattern, formula.upper())
    
    # Clean up $ signs for pure cell addresses
    clean_refs = []
    for ref in refs:
        clean = ref.replace("$", "")
        if clean not in clean_refs:
            clean_refs.append(clean)
    return clean_refs


def extract_range_references(formula: str) -> List[str]:
    """Extract range references like A1:A10 from formulas."""
    if not formula:
        return []
    pattern = r"(\$?[A-Z]{1,3}\$?\d{1,7}:\$?[A-Z]{1,3}\$?\d{1,7})"
    ranges = re.findall(pattern, formula.upper())
    return [r.replace("$", "") for r in ranges]


def extract_functions_used(formula: str) -> List[str]:
    """Extract Excel function names used in a formula."""
    if not formula:
        return []
    pattern = r"([A-Z][A-Z0-9_.]+)\s*\("
    functions = re.findall(pattern, formula.upper())
    return list(set(functions))


def classify_cell_type(formula: str, functions: List[str]) -> str:
    """Classify the type of cell based on its formula."""
    if not formula or not formula.startswith("="):
        return "static_value"
    
    f_upper = formula.upper()
    
    if "VLOOKUP" in f_upper or "HLOOKUP" in f_upper or "INDEX" in f_upper or "MATCH" in f_upper:
        return "lookup"
    if "IF" in f_upper or "IFERROR" in f_upper or "IFS" in f_upper:
        return "conditional_calculation"
    if "SUM" in f_upper or "AVERAGE" in f_upper or "COUNT" in f_upper:
        return "aggregation"
    if "CONCATENATE" in f_upper or "&" in formula:
        return "string_operation"
    if any(op in formula for op in ["+", "-", "*", "/"]):
        return "calculation"
    if "=" in formula[1:]:
        return "reference"
    
    return "calculation"


def detect_unit_from_context(ws, row: int, col: int, value: Any) -> Optional[str]:
    """Try to detect the unit by reading nearby cells (headers, labels)."""
    units_patterns = {
        r'%': 'percent',
        r'gram': 'gram',
        r'mg': 'milligram',
        r'kg': 'kilogram',
        r'ml': 'milliliter',
        r'mL': 'milliliter',
        r'L\b': 'liter',
        r'mol': 'mol',
        r'M\b': 'molar',
        r'N\b': 'normalitas',
        r'ppm': 'ppm',
        r'°C': 'celsius',
        r'menit': 'menit',
        r'detik': 'detik',
        r'cm': 'centimeter',
        r'mm': 'millimeter',
    }
    
    # Check cells to the left and above for unit hints
    candidates = []
    for dc in range(-3, 1):
        for dr in range(-3, 1):
            try:
                check_row = row + dr
                check_col = col + dc
                if check_row < 1 or check_col < 1:
                    continue
                cell = ws.cell(row=check_row, column=check_col)
                if cell.value and isinstance(cell.value, str):
                    candidates.append(cell.value)
            except Exception:
                pass
    
    for text in candidates:
        for pattern, unit in units_patterns.items():
            if re.search(pattern, text, re.IGNORECASE):
                return unit
    
    return None


def detect_label(ws, row: int, col: int) -> Optional[str]:
    """Try to find a label for this cell by looking at cells to the left or above."""
    # Look left
    for dc in range(1, 6):
        try:
            check_col = col - dc
            if check_col < 1:
                break
            cell = ws.cell(row=row, column=check_col)
            if cell.value and isinstance(cell.value, str) and len(cell.value.strip()) > 1:
                return cell.value.strip()
        except Exception:
            pass
    
    # Look up in same column
    for dr in range(1, 6):
        try:
            check_row = row - dr
            if check_row < 1:
                break
            cell = ws.cell(row=check_row, column=col)
            if cell.value and isinstance(cell.value, str) and len(cell.value.strip()) > 1:
                return cell.value.strip()
        except Exception:
            pass
    
    return None


def is_lookup_table_region(ws, start_row: int, start_col: int) -> bool:
    """Detect if a region looks like a lookup table."""
    # Check if there are multiple consecutive rows with values in this column
    count = 0
    for r in range(start_row, min(start_row + 20, ws.max_row + 1)):
        cell = ws.cell(row=r, column=start_col)
        if cell.value is not None:
            count += 1
    return count >= 5


def extract_merged_cells_info(ws) -> Dict[str, str]:
    """Extract merged cell ranges and map them."""
    merged = {}
    for merge_range in ws.merged_cells.ranges:
        merged[str(merge_range)] = str(merge_range.start_cell.coordinate)
    return merged


def read_all_data(ws, max_rows=None, max_cols=None) -> Dict[str, Any]:
    """Read all cell data from a worksheet."""
    data = {}
    mr = max_rows or ws.max_row or 0
    mc = max_cols or ws.max_column or 0
    
    for row in range(1, mr + 1):
        for col in range(1, mc + 1):
            cell = ws.cell(row=row, column=col)
            cell_ref = f"{get_column_letter(col)}{row}"
            
            if cell.value is not None or (hasattr(cell, 'value') and cell.data_type == 'f'):
                data[cell_ref] = {
                    "value": cell.value,
                    "data_type": cell.data_type,
                    "number_format": cell.number_format,
                    "is_formula": str(cell.value).startswith("=") if cell.value else False,
                }
    return data


def extract_workbook_full(filepath: str) -> Dict[str, Any]:
    """Full extraction of a workbook with formulas preserved."""
    wb_name = os.path.basename(filepath)
    print(f"\n{'='*80}")
    print(f"Processing: {wb_name}")
    print(f"{'='*80}")
    
    # Load with data_only=False to get formulas
    wb_formulas = openpyxl.load_workbook(filepath, data_only=False)
    # Load with data_only=True to get cached values
    wb_values = openpyxl.load_workbook(filepath, data_only=True)
    
    workbook_data = {
        "workbook": wb_name,
        "sheets": [],
        "formulas": [],
        "lookup_tables": [],
        "summary": {
            "total_sheets": len(wb_formulas.sheetnames),
            "total_formulas": 0,
            "total_inputs": 0,
            "total_lookups": 0,
            "sheet_names": wb_formulas.sheetnames,
        }
    }
    
    for sheet_name in wb_formulas.sheetnames:
        print(f"\n  Sheet: {sheet_name}")
        ws_formula = wb_formulas[sheet_name]
        ws_value = wb_values[sheet_name]
        
        sheet_data = {
            "name": sheet_name,
            "dimensions": {
                "max_row": ws_formula.max_row,
                "max_column": ws_formula.max_column,
            },
            "merged_cells": extract_merged_cells_info(ws_formula),
            "cells": [],
            "formula_cells": [],
            "input_cells": [],
            "output_cells": [],
            "static_data": [],
        }
        
        all_formula_cells = set()
        all_referenced_cells = set()
        formula_entries = []
        
        mr = ws_formula.max_row or 0
        mc = ws_formula.max_column or 0
        
        # First pass: collect all formulas and their references
        for row in range(1, mr + 1):
            for col in range(1, mc + 1):
                cell_f = ws_formula.cell(row=row, column=col)
                cell_v = ws_value.cell(row=row, column=col)
                cell_ref = f"{get_column_letter(col)}{row}"
                
                if cell_f.value is not None and isinstance(cell_f.value, str) and cell_f.value.startswith("="):
                    formula_str = cell_f.value
                    refs = extract_cell_references(formula_str)
                    ranges = extract_range_references(formula_str)
                    functions = extract_functions_used(formula_str)
                    cell_type = classify_cell_type(formula_str, functions)
                    unit = detect_unit_from_context(ws_formula, row, col, cell_f.value)
                    label = detect_label(ws_formula, row, col)
                    
                    all_formula_cells.add(cell_ref)
                    for r in refs:
                        all_referenced_cells.add(r)
                    
                    entry = {
                        "workbook": wb_name,
                        "sheet": sheet_name,
                        "cell": cell_ref,
                        "formula": formula_str,
                        "cached_value": cell_v.value if cell_v.value is not None else None,
                        "type": cell_type,
                        "inputs": refs,
                        "ranges": ranges,
                        "functions_used": functions,
                        "label": label,
                        "unit": unit,
                        "number_format": cell_f.number_format,
                    }
                    
                    formula_entries.append(entry)
                    sheet_data["formula_cells"].append(entry)
                    workbook_data["formulas"].append(entry)
                    
                elif cell_f.value is not None:
                    # Static value cell
                    cell_info = {
                        "cell": cell_ref,
                        "value": cell_f.value if not isinstance(cell_f.value, bytes) else str(cell_f.value),
                        "data_type": cell_f.data_type,
                        "label": detect_label(ws_formula, row, col),
                    }
                    sheet_data["static_data"].append(cell_info)
        
        # Identify input cells: referenced by formulas but not themselves formulas
        for ref in all_referenced_cells:
            if ref not in all_formula_cells:
                # This is an input cell
                try:
                    match = re.match(r"([A-Z]+)(\d+)", ref)
                    if match:
                        col_idx = column_index_from_string(match.group(1))
                        row_idx = int(match.group(2))
                        cell_f = ws_formula.cell(row=row_idx, column=col_idx)
                        cell_v = ws_value.cell(row=row_idx, column=col_idx)
                        label = detect_label(ws_formula, row_idx, col_idx)
                        unit = detect_unit_from_context(ws_formula, row_idx, col_idx, cell_f.value)
                        
                        input_entry = {
                            "cell": ref,
                            "value": cell_v.value if cell_v.value is not None else cell_f.value,
                            "label": label,
                            "unit": unit,
                            "data_type": cell_f.data_type,
                        }
                        sheet_data["input_cells"].append(input_entry)
                except Exception as e:
                    pass
        
        # Identify output cells: formula cells not referenced by other formulas
        output_candidates = all_formula_cells - all_referenced_cells
        for ref in output_candidates:
            for entry in formula_entries:
                if entry["cell"] == ref:
                    sheet_data["output_cells"].append({
                        "cell": ref,
                        "formula": entry["formula"],
                        "label": entry.get("label"),
                        "unit": entry.get("unit"),
                        "cached_value": entry.get("cached_value"),
                    })
        
        # Detect lookup tables
        # Check for columns with many sequential numeric values
        for col in range(1, mc + 1):
            numeric_count = 0
            start_row_lt = None
            for row in range(1, mr + 1):
                cell = ws_formula.cell(row=row, column=col)
                if isinstance(cell.value, (int, float)):
                    if start_row_lt is None:
                        start_row_lt = row
                    numeric_count += 1
                else:
                    if numeric_count >= 10:
                        col_letter = get_column_letter(col)
                        # Check if header exists
                        header_cell = ws_formula.cell(row=max(1, (start_row_lt or 1) - 1), column=col)
                        header = header_cell.value if header_cell.value else f"Column {col_letter}"
                        
                        lookup_entry = {
                            "sheet": sheet_name,
                            "column": col_letter,
                            "start_row": start_row_lt,
                            "end_row": start_row_lt + numeric_count - 1 if start_row_lt else row,
                            "count": numeric_count,
                            "header": str(header),
                            "sample_values": [],
                        }
                        # Get sample values
                        if start_row_lt:
                            for sr in range(start_row_lt, min(start_row_lt + 5, mr + 1)):
                                sv = ws_formula.cell(row=sr, column=col).value
                                if sv is not None:
                                    lookup_entry["sample_values"].append(sv)
                        
                        workbook_data["lookup_tables"].append(lookup_entry)
                    numeric_count = 0
                    start_row_lt = None
            
            # Handle case where table extends to end of sheet
            if numeric_count >= 10 and start_row_lt:
                col_letter = get_column_letter(col)
                header_cell = ws_formula.cell(row=max(1, start_row_lt - 1), column=col)
                header = header_cell.value if header_cell.value else f"Column {col_letter}"
                workbook_data["lookup_tables"].append({
                    "sheet": sheet_name,
                    "column": col_letter,
                    "start_row": start_row_lt,
                    "end_row": start_row_lt + numeric_count - 1,
                    "count": numeric_count,
                    "header": str(header),
                })
        
        formula_count = len(sheet_data["formula_cells"])
        input_count = len(sheet_data["input_cells"])
        print(f"    Formulas: {formula_count}, Inputs: {input_count}, Outputs: {len(sheet_data['output_cells'])}")
        
        workbook_data["summary"]["total_formulas"] += formula_count
        workbook_data["summary"]["total_inputs"] += input_count
        
        workbook_data["sheets"].append(sheet_data)
    
    workbook_data["summary"]["total_lookups"] = len(workbook_data["lookup_tables"])
    
    wb_formulas.close()
    wb_values.close()
    
    return workbook_data


def build_dependency_graph(formulas: List[Dict]) -> Dict[str, List[str]]:
    """Build a dependency graph from formula entries."""
    graph = defaultdict(list)
    for entry in formulas:
        cell_key = f"{entry['sheet']}!{entry['cell']}"
        for inp in entry.get("inputs", []):
            inp_key = f"{entry['sheet']}!{inp}"
            graph[cell_key].append(inp_key)
    return dict(graph)


def serialize_value(val):
    """Make values JSON-serializable."""
    if val is None:
        return None
    if isinstance(val, (int, float, str, bool)):
        return val
    if isinstance(val, bytes):
        return val.decode('utf-8', errors='replace')
    return str(val)


def deep_serialize(obj):
    """Recursively serialize all values in a data structure."""
    if isinstance(obj, dict):
        return {k: deep_serialize(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [deep_serialize(item) for item in obj]
    else:
        return serialize_value(obj)


def main():
    os.makedirs(DOCS_DIR, exist_ok=True)
    
    all_workbooks = []
    all_formulas = []
    
    for wb_file in WORKBOOK_FILES:
        filepath = os.path.join(BASE_DIR, wb_file)
        if not os.path.exists(filepath):
            print(f"WARNING: {filepath} not found!")
            continue
        
        wb_data = extract_workbook_full(filepath)
        all_workbooks.append(wb_data)
        all_formulas.extend(wb_data["formulas"])
    
    # Build dependency graph
    dep_graph = build_dependency_graph(all_formulas)
    
    # Compile full output
    output = {
        "extraction_metadata": {
            "tool": "extract_excel_formulas.py",
            "version": "1.0.0",
            "workbooks_processed": len(all_workbooks),
            "total_formulas_extracted": len(all_formulas),
        },
        "workbooks": all_workbooks,
        "dependency_graph": dep_graph,
    }
    
    # Deep serialize to handle non-JSON-serializable types
    output = deep_serialize(output)
    
    # Write JSON
    output_path = os.path.join(DOCS_DIR, "excel-formulas.json")
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=2, ensure_ascii=False, default=str)
    
    print(f"\n{'='*80}")
    print(f"EXTRACTION COMPLETE")
    print(f"{'='*80}")
    print(f"Output: {output_path}")
    print(f"Total workbooks: {len(all_workbooks)}")
    print(f"Total formulas: {len(all_formulas)}")
    print(f"Dependency edges: {sum(len(v) for v in dep_graph.values())}")
    
    for wb in all_workbooks:
        print(f"\n  {wb['workbook']}:")
        print(f"    Sheets: {wb['summary']['sheet_names']}")
        print(f"    Formulas: {wb['summary']['total_formulas']}")
        print(f"    Inputs: {wb['summary']['total_inputs']}")
        print(f"    Lookup tables: {wb['summary']['total_lookups']}")
    
    return output


if __name__ == "__main__":
    result = main()
