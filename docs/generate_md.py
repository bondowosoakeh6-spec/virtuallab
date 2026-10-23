import re
import os
import json

def parse_txt(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    workbooks = []
    current_wb = None
    current_sheet = None

    for line in content.split('\n'):
        if line.startswith('WORKBOOK: '):
            if current_wb:
                if current_sheet:
                    current_wb['sheets'].append(current_sheet)
                workbooks.append(current_wb)
            current_wb = {'name': line.replace('WORKBOOK: ', '').strip(), 'sheets': []}
            current_sheet = None
        elif line.startswith('--- ') and line.endswith(' ---'):
            if current_sheet:
                current_wb['sheets'].append(current_sheet)
            sheet_name = line.replace('--- ', '').replace(' ---', '').strip()
            current_sheet = {
                'name': sheet_name,
                'formulas': [],
                'inputs': [],
                'outputs': [],
                'formula_count': 0,
                'input_count': 0,
                'output_count': 0
            }
        elif line.strip().startswith('Formula cells:'):
            current_sheet['formula_count'] = int(line.split(':')[1].strip())
        elif line.strip().startswith('Input cells:'):
            current_sheet['input_count'] = int(line.split(':')[1].strip())
        elif line.strip().startswith('Output cells:'):
            current_sheet['output_count'] = int(line.split(':')[1].strip())
        elif line.strip().startswith('FORMULA '):
            parts = line.strip().split(':', 1)
            cell = parts[0].replace('FORMULA ', '').strip()
            formula = parts[1].strip()
            current_sheet['formulas'].append({'cell': cell, 'formula': formula})
        elif line.strip().startswith('type='):
            # Parse properties
            props_str = line.strip()
            props = {}
            for chunk in props_str.split(', '):
                if '=' in chunk:
                    k, v = chunk.split('=', 1)
                    props[k] = v
            current_sheet['formulas'][-1].update(props)
        elif line.strip().startswith('INPUTS:'):
            pass # skip header
        elif current_sheet and line.strip() and ':' in line and 'value=' in line:
            # Looks like an input line
            # E11: value= , label=Bobot wadah kosong (g/mg), unit=milligram
            cell_part, rest = line.strip().split(':', 1)
            cell = cell_part.strip()
            props = {}
            for chunk in rest.split(', '):
                if '=' in chunk:
                    k, v = chunk.split('=', 1)
                    props[k] = v
            current_sheet['inputs'].append({'cell': cell, **props})
            
    if current_sheet:
        current_wb['sheets'].append(current_sheet)
    if current_wb:
        workbooks.append(current_wb)
        
    return workbooks

def generate_md(workbooks, json_data, out_filepath):
    lines = []
    lines.append('# Excel Workbook Analysis\n')
    lines.append('A comprehensive mapping of both workbooks.\n')
    
    for wb in workbooks:
        lines.append(f"## Workbook: {wb['name']}\n")
        lines.append('### Summary')
        lines.append(f"- Total sheets: {len(wb['sheets'])}")
        sheet_names = [s['name'] for s in wb['sheets']]
        lines.append(f"- Sheets: {', '.join(sheet_names)}\n")
        
        for sheet in wb['sheets']:
            lines.append(f"### Sheet: {sheet['name']}\n")
            
            lines.append('**Formulas Table:**\n')
            lines.append('| Cell | Formula | Type | Inputs | Label/Description | Unit | Cached Value |')
            lines.append('|---|---|---|---|---|---|---|')
            for f in sheet['formulas']:
                cell = f.get('cell', '')
                form = f.get('formula', '').replace('|', '\\|')
                ftype = f.get('type', '')
                inputs = f.get('inputs', '')
                label = f.get('label', '').replace('|', '\\|')
                # Try to get unit from JSON data if needed, or assume blank if not present
                unit = f.get('unit', '') 
                cached = str(f.get('cached', '')).replace('|', '\\|')
                lines.append(f"| {cell} | `{form}` | {ftype} | {inputs} | {label} | {unit} | {cached} |")
            lines.append('\n')
            
            lines.append('**INPUT CELLS:**')
            for i in sheet['inputs']:
                cell = i.get('cell', '')
                val = i.get('value', '')
                label = i.get('label', '')
                lines.append(f"- {cell} (Label: {label}, Default: {val})")
            lines.append('\n')
            
            lines.append('**OUTPUT CELLS:**')
            lines.append('*(Derived from terminal formula nodes)*')
            # Determine output cells: those that aren't used as input anywhere else
            all_inputs_used = set()
            for f in sheet['formulas']:
                inp_str = f.get('inputs', '[]')
                if inp_str.startswith('['):
                    try:
                        import ast
                        inps = ast.literal_eval(inp_str)
                        all_inputs_used.update(inps)
                    except:
                        pass
            out_cells = [f['cell'] for f in sheet['formulas'] if f['cell'] not in all_inputs_used]
            for c in out_cells:
                lines.append(f"- {c}")
            lines.append('\n')
            
            lines.append('**DEPENDENCY CHAIN:**')
            for f in sheet['formulas']:
                inp_str = f.get('inputs', '[]')
                if inp_str != '[]':
                    lines.append(f"- {f['cell']} depends on {inp_str}")
            lines.append('\n')
            
    with open(out_filepath, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

if __name__ == '__main__':
    wbs = parse_txt('c:/Users/Asus/Documents/VirtualLab_AKUANALIS/docs/formula_analysis_output.txt')
    # we could also load json if we want more details, but txt has most of it.
    with open('c:/Users/Asus/Documents/VirtualLab_AKUANALIS/docs/excel-formulas.json', 'r', encoding='utf-8') as f:
        j_data = json.load(f)
    generate_md(wbs, j_data, 'c:/Users/Asus/Documents/VirtualLab_AKUANALIS/docs/EXCEL_WORKBOOK_ANALYSIS.md')
    print("Done")
