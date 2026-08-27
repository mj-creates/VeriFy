import os
from dotenv import load_dotenv
import requests

load_dotenv()
api_key = os.getenv("GROQ_API_KEY")

headers = {
    "Authorization": f"Bearer {api_key}"
}
response = requests.get("https://api.groq.com/openai/v1/models", headers=headers)
if response.status_code == 200:
    data = response.json()
    models = [m['id'] for m in data['data']]
    print("Available models:")
    for m in models:
        print(m)
else:
    print("Error:", response.status_code, response.text)
