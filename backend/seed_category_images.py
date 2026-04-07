import sqlite3

images = {
    "Ethnic": "https://images.unsplash.com/photo-1583391733958-d259c1b3f9ff?q=80&w=1000&auto=format&fit=crop",
    "Formal": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop",
    "Kurtis": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop",
    "Kurti Sets": "https://images.unsplash.com/photo-1596455607563-ad6193f76b17?q=80&w=1000&auto=format&fit=crop"
}

conn = sqlite3.connect('boutique.db')
cursor = conn.cursor()

for name, url in images.items():
    print(f"Updating {name} with image...")
    cursor.execute("UPDATE categories SET image_url = ? WHERE name = ?", (url, name))

conn.commit()
conn.close()
print("Categories updated successfully!")
