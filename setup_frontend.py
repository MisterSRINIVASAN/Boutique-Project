import subprocess
import os

os.makedirs(r"c:\Users\SrinI\OneDrive\Desktop\Boutique_Project\frontend", exist_ok=True)
os.chdir(r"c:\Users\SrinI\OneDrive\Desktop\Boutique_Project\frontend")

commands = [
    "npx -y create-vite@latest . --template react",
    "npm install",
    "npm install -D tailwindcss postcss autoprefixer",
    "npx tailwindcss init -p"
]

for cmd in commands:
    print(f"Running: {cmd}")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    print("STDOUT:", result.stdout)
    print("STDERR:", result.stderr)
    if result.returncode != 0:
        print("FAILED")
        break
