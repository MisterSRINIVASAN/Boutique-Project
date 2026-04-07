import sqlite3
import traceback
try:
    conn = sqlite3.connect('backend/boutique.db', timeout=1)
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM products')
    p = cursor.fetchone()[0]
    cursor.execute('SELECT COUNT(*) FROM lookbook')
    l = cursor.fetchone()[0]
    with open('check_db.txt', 'w') as f:
        f.write(f'P={p}, L={l}')
except Exception as e:
    with open('check_db.txt', 'w') as f:
        f.write(f'ERROR: {str(e)}\n{traceback.format_exc()}')
