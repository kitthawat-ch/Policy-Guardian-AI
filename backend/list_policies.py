import urllib.request, json

# Fetch section details for each policy (only first few sections)
for policy_id in [1, 2]:
    # We'll try section IDs 1-10
    for sec_id in range(1, 10):
        try:
            r = urllib.request.urlopen(f'http://localhost:8000/api/documents/sections/{sec_id}')
            data = json.loads(r.read())
            if data['policy_id'] == policy_id:
                print(f"\n{'='*60}")
                print(f"Policy: {data['policy_title']} (ID:{data['policy_id']})")
                print(f"Section {data['section_number']}: {data['title']}")
                print(f"Content preview:\n{data['content'][:500]}")
        except:
            pass
