import requests
import json

url = "http://localhost:8000/api/ask-policy-stream"
payload = {
    "question": "I want to install an unapproved software to test a new tool on the production server. Is this allowed?",
    "messages": [
        {"role": "user", "content": "I want to install an unapproved software to test a new tool on the production server. Is this allowed?"}
    ],
    "user_id": 1,
    "active_skills": []
}

try:
    with requests.post(url, json=payload, stream=True) as r:
        r.raise_for_status()
        for line in r.iter_lines():
            if line:
                print(line.decode('utf-8'))
except Exception as e:
    print(f"Error: {e}")
