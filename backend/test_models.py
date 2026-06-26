import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load API key from .env
backend_dir = os.path.dirname(__file__)
env_path = os.path.join(backend_dir, ".env")
load_dotenv(env_path)

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("No GEMINI_API_KEY found in .env!")
    exit(1)

genai.configure(api_key=api_key)

print("Fetching available models...")
models = []
try:
    for m in genai.list_models():
        if 'generateContent' in m.supported_generation_methods:
            models.append(m.name)
            print(f"[OK] Found available model: {m.name}")
except Exception as e:
    print(f"Error fetching models: {e}")

print("\n--- Testing Specific Models ---")
models_to_test = [
    "models/gemini-3.5-flash",
    "models/gemini-3.5-pro",
    "models/gemini-3.1-flash-lite",
    "models/gemini-3.0-flash",
    "models/gemini-3.0-pro",
    "models/gemini-2.5-flash",
    "models/gemini-2.5-pro",
]

for model_name in models_to_test:
    try:
        model = genai.GenerativeModel(model_name)
        response = model.generate_content("Say 'Test OK'")
        print(f"[OK] {model_name} -> SUCCESS: {response.text.strip()}")
    except Exception as e:
        print(f"[FAILED] {model_name} -> FAILED: {str(e)[:100]}...")
