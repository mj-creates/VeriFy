import os
import glob

files = glob.glob('agent-core/*.py')
files.append('run_pipeline.py')
if os.path.exists('backend/main.py'):
    files.append('backend/main.py')

for f in files:
    if 'tools.py' in f: continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    content = content.replace('llama-3.1-70b-versatile', 'llama-3.3-70b-versatile')
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

print('Updated files to use Groq API llama-3.3-70b-versatile.')
