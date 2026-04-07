import os
import re

def get_api_url_safe_placeholder(match):
    return (
        "${(() => { "
        "let b = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'; "
        "if(!b.startsWith('http')) b = 'https://' + b; "
        "return b.replace(/\\/$/, ''); "
        "})()}"
    )

def fix_file(path):
    print(f"Checking {path}")
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    pattern = r"\$\{import\.meta\.env\.VITE_API_BASE_URL\s*\|\|\s*'[^']*'\}"
    new_content = re.sub(pattern, get_api_url_safe_placeholder, content)
    
    if new_content != content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        return True
    return False

# Use absolute paths to be safe
base_dir = r"c:\Users\SrinI\OneDrive\Desktop\Boutique_Project"
components_dir = os.path.join(base_dir, 'frontend', 'src', 'components')
print(f"Searching in: {components_dir}")

files_fixed = 0
if os.path.exists(components_dir):
    for filename in os.listdir(components_dir):
        if filename.endswith('.jsx'):
            if fix_file(os.path.join(components_dir, filename)):
                print(f"Fixed {filename}")
                files_fixed += 1
else:
    print(f"PATH NOT FOUND: {components_dir}")

print(f"Total files fixed: {files_fixed}")
