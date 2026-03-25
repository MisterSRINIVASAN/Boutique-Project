import os
import re

frontend_src = r"c:\Users\SrinI\OneDrive\Desktop\Boutique_Project\frontend\src"

def replace_hardcoded_urls():
    for root, dirs, files in os.walk(frontend_src):
        for file in files:
            if file.endswith(('.jsx', '.js')):
                path = os.path.join(root, file)
                with open(path, 'r', encoding='utf-8') as f:
                    content = f.read()

                # Replace 'http://127.0.0.1:8000/api...'
                # We will turn it into `${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}/api...`
                new_content = re.sub(
                    r"['\"]http://127\.0\.0\.1:8000(/[^'\"]*)['\"]", 
                    r"`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}\1`", 
                    content
                )
                
                # Replace existing template literals `http://127.0.0.1:8000/api/${id}`
                new_content = re.sub(
                    r"`http://127\.0\.0\.1:8000(/[^`]+)`", 
                    r"`${import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'}\1`", 
                    new_content
                )

                if new_content != content:
                    with open(path, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {file}")

if __name__ == "__main__":
    replace_hardcoded_urls()
