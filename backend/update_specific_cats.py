import sqlite3

images = {
    "Ethnic": "https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=800",
    "Kurti Sets": "https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=800"
}

conn = sqlite3.connect('boutique.db')
cursor = conn.cursor()

for name, url in images.items():
    cursor.execute("UPDATE categories SET image_url = ? WHERE name = ?", (url, name))

conn.commit()
conn.close()
print("Fixed missing images!")
