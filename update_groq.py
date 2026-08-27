import os
import glob

files = glob.glob('agent-core/*.py')
if os.path.exists('backend/main.py'):
    files.append('backend/main.py')

for f in files:
    if 'tools.py' in f: continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    content = content.replace('gemini-1.5-pro', 'llama-3.1-70b-versatile')
    content = content.replace('gemini-3.6-flash', 'llama-3.1-70b-versatile')
    content = content.replace('base_url="https://generativelanguage.googleapis.com/v1beta/openai/"', 'base_url="https://api.groq.com/openai/v1"')
    content = content.replace('GEMINI_API_KEY', 'GROQ_API_KEY')
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print('Updated files to use Groq API.')
