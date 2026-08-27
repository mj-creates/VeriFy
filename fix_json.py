import glob

files = glob.glob('agent-core/*.py')
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if "return json.loads(raw_response)" in content and "raw_response.startswith" not in content:
        new_content = content.replace("        return json.loads(raw_response)", 
            "        if raw_response.startswith('```json'):\n"
            "            raw_response = raw_response[7:]\n"
            "        if raw_response.startswith('```'):\n"
            "            raw_response = raw_response[3:]\n"
            "        if raw_response.endswith('```'):\n"
            "            raw_response = raw_response[:-3]\n"
            "        raw_response = raw_response.strip()\n"
            "        return json.loads(raw_response)"
        )
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content)
        print(f"Fixed JSON in {f}")
    
    # Also fix retry delay in all files
    new_content2 = content.replace("time.sleep(10)", "time.sleep(25)")
    new_content2 = new_content2.replace("retrying in 10s...", "retrying in 25s...")
    if new_content2 != content:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(new_content2)
        print(f"Fixed retry in {f}")

