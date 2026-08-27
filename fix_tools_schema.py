import glob

files = glob.glob('agent-core/*_researcher.py')
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Update search tool schema
    content = content.replace(
        '"required": ["query"],',
        '"required": ["query"],\n                "additionalProperties": False,'
    )
    
    # Update browser tool schema
    content = content.replace(
        '"required": ["url"],',
        '"required": ["url"],\n                "additionalProperties": False,'
    )
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)
    print(f"Updated schemas in {f}")
