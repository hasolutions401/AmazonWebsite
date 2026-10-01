import json
import re
from pathlib import Path

ROOT = Path('.')
PAGES_DIR = ROOT / 'Pages'
DATA = ROOT / '_price_data.json'


def norm(text: str) -> str:
    return re.sub(r'[^a-z0-9]+', '', (text or '').lower())


def map_blank_source(row: dict) -> str:
    brand = (row.get('Brand') or '').lower()
    category = (row.get('Category') or '').lower()
    if 'airis' in brand:
        return 'Airis.html'
    if 'zero nicotine disposable raz' in brand:
        return 'zeronicotine.html'
    if 'zyn' in brand:
        return 'zyn.html'
    if 'ciger' in category or 'cig' in category:
        return 'Cigarettes.html'
    return ''


rows = json.loads(DATA.read_text(encoding='utf-8'))
if isinstance(rows, dict):
    rows = [rows]

by_page = {}
for row in rows:
    page = (row.get('SourcePage') or '').strip()
    if not page:
        page = map_blank_source(row)
    if not page:
        continue
    by_page.setdefault(page, []).append(row)

updated_files = []
for page, page_rows in by_page.items():
    page_path = PAGES_DIR / page
    if not page_path.exists():
        continue

    content = page_path.read_text(encoding='utf-8')

    # Update only files that already use item-level JS price entries.
    if not re.search(r'"[^"]+"\s*:\s*\{\s*price\s*:', content):
        continue

    price_map = {}
    for row in page_rows:
        item_name = (row.get('ItemName') or '').strip()
        if not item_name:
            continue
        try:
            price_val = float(row.get('Price'))
        except Exception:
            continue
        price_map[norm(item_name)] = f'{price_val:.2f}'

    changed = [False]

    def repl(match: re.Match) -> str:
        key = match.group(2)
        old_price = match.group(3)
        new_price = price_map.get(norm(key))
        if new_price and new_price != old_price:
            changed[0] = True
            return f'{match.group(1)}{new_price}'
        return match.group(0)

    new_content = re.sub(r'("([^"]+)"\s*:\s*\{\s*price\s*:\s*)([0-9]+(?:\.[0-9]+)?)', repl, content)

    if changed[0]:
        page_path.write_text(new_content, encoding='utf-8')
        updated_files.append(page)

print('updated:', ', '.join(updated_files))
