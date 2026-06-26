import json, os
for f in ['ask-policy', 'reviewer', 'evaluation']:
    p = f'src/app/{f}/page.tsx'
    if os.path.exists(p):
        with open(p, 'r', encoding='utf-8') as file:
            data = file.read().strip()
        
        while data.startswith('"') and data.endswith('"'):
            try:
                data = json.loads(data)
            except Exception as e:
                break
        
        with open(p, 'w', encoding='utf-8') as file:
            file.write(data)
        print(f'Fixed {f}')
