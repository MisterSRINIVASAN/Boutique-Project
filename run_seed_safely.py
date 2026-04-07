import sys
import traceback
import os
import subprocess

try:
    with open('seed_auto_log.txt', 'w') as f:
        f.write("Starting DB Seeder...\n")
        
    os.chdir('backend')
    
    # Run the seed_db.py script and capture output
    result = subprocess.run([sys.executable, 'seed_db.py'], capture_output=True, text=True)
    
    with open('../seed_auto_log.txt', 'a') as f:
        f.write("Return Code: " + str(result.returncode) + "\n")
        f.write("STDOUT:\n" + result.stdout + "\n")
        f.write("STDERR:\n" + result.stderr + "\n")
        f.write("Done.\n")
        
except Exception as e:
    with open('seed_auto_log.txt' if 'f' not in locals() else '../seed_auto_log.txt', 'a') as f:
        f.write("FATAL ERROR:\n" + str(e) + "\n" + traceback.format_exc())
