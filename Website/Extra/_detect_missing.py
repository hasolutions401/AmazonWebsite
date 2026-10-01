import json,re,glob,os
from pathlib import Path

def norm(s):
    return re.sub(r'[^a-z0-9]+','', (s or '').lower())

rows=json.load(open('_price_data.json',encoding='utf-8'))
if isinstance(rows,dict): rows=[rows]

for r in rows:
    if not (r.get('SourcePage') or '').strip():
        b=(r.get('Brand') or '').lower()
        c=(r.get('Category') or '').lower()
        if 'airis' in b:
            r['SourcePage']='Airis.html'
        elif 'zero nicotine disposable raz' in b:
            r['SourcePage']='zeronicotine.html'
        elif 'zyn' in b:
            r['SourcePage']='zyn.html'
        elif 'ciger' in c or 'cig' in c:
            r['SourcePage']='Cigarettes.html'

by_page={}
for r in rows:
    p=(r.get('SourcePage') or '').strip()
    if not p: continue
    by_page.setdefault(p,[]).append(r)

for p,items in sorted(by_page.items()):
    fp=Path('Pages')/p
    if not fp.exists():
        continue
    txt=fp.read_text(encoding='utf-8')
    names=set()
    # quoted object keys
    for m in re.finditer(r'"([^"]+)"\s*:\s*\{\s*price\s*:',txt):
        names.add(norm(m.group(1)))
    # flavor-option label
    for m in re.finditer(r'<div class="flavor-option"[^>]*>([^<]+)</div>',txt,flags=re.I):
        names.add(norm(m.group(1).strip()))
    missing=[]
    for r in items:
        n=norm(r.get('ItemName',''))
        if n and n not in names:
            missing.append(r.get('ItemName'))
    if missing:
        print(f'--- {p} missing {len(missing)}')
        for x in sorted(set(missing)):
            print('  ',x)
