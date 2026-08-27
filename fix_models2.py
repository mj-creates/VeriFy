import glob

files = glob.glob('agent-core/*.py')
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    new_content = content.replace('"llama-3.3-70b-versatile"', '"llama-3.1-70b-versatile"')
    
    if new_content != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Updated {f}")
    else:
        print(f"No changes in {f}")
