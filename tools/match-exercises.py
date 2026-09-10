import json, re, difflib, unicodedata
from pathlib import Path
root=Path(r'C:\Users\user\Desktop\DulusGymWork')
data=json.loads(Path(r'C:\Users\user\AppData\Local\Temp\free-exercises.json').read_text(encoding='utf-8'))
lines=(root/'exercises.js').read_text(encoding='utf-8').splitlines()
items=[]
for line in lines:
    m=re.search(r"exercise\('([^']+)','([^']+)'.*?\], '([^']*)',", line)
    if m: items.append({'id':m.group(1),'name':m.group(2),'alt':m.group(3)})
def norm(s):
    s=unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+',' ',s).strip()
for item in items:
    q=norm(item['alt'] or item['name'])
    scored=[]
    for ex in data:
        score=difflib.SequenceMatcher(None,q,norm(ex['name'])).ratio()
        scored.append((score,ex['name'],ex['id'],ex.get('images',[])))
    scored.sort(reverse=True)
    print('\n'+item['id']+' | '+item['name']+' | '+item['alt'])
    for score,name,eid,imgs in scored[:5]: print(f'  {score:.3f}  {name} | {eid} | {imgs[:2]}')
