#!/usr/bin/env python3
"""Analyze extracted Excel formulas and print detailed summary."""
import json

with open('docs/excel-formulas.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for wb in data['workbooks']:
    print(f"\n{'='*80}")
    print(f"WORKBOOK: {wb['workbook']}")
    print(f"{'='*80}")
    
    for sheet in wb['sheets']:
        print(f"\n--- {sheet['name']} ---")
        print(f"  Formula cells: {len(sheet['formula_cells'])}")
        print(f"  Input cells: {len(sheet['input_cells'])}")
        print(f"  Output cells: {len(sheet['output_cells'])}")
        
        # Print all formulas
        for fc in sheet['formula_cells']:
            label = fc.get('label', '') or ''
            cached = fc.get('cached_value', '') 
            if cached is None:
                cached = ''
            print(f"  FORMULA {fc['cell']}: {fc['formula']}")
            print(f"         type={fc['type']}, inputs={fc['inputs']}, label={label[:50]}, cached={cached}")
        
        # Print inputs
        if sheet['input_cells']:
            print(f"\n  INPUTS:")
            for ic in sheet['input_cells']:
                val = ic.get('value', '')
                if val is None:
                    val = ''
                label = ic.get('label', '') or ''
                unit = ic.get('unit', '') or ''
                print(f"    {ic['cell']}: value={val}, label={label[:50]}, unit={unit}")

    # Print lookup tables
    if wb.get('lookup_tables'):
        print(f"\n  LOOKUP TABLES:")
        for lt in wb['lookup_tables']:
            print(f"    Sheet={lt['sheet']}, Col={lt['column']}, Rows={lt['start_row']}-{lt['end_row']}, Count={lt['count']}, Header={lt.get('header','')}")
