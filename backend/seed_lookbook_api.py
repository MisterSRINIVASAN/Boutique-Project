import requests
import hashlib

def login():
    url = "http://127.0.0.1:8000/api/auth/login"
    payload = {"email": "test@example.com", "password": "password123"}
    try:
        res = requests.post(url, json=payload)
        res.raise_for_status()
        return res.json()["access_token"]
    except Exception as e:
        print(f"Login failed: {e}")
        return None

def seed_lookbook(token):
    admin_url = "http://127.0.0.1:8000/api/admin/lookbook"
    headers = {"Authorization": f"Bearer {token}"}
    
    local_images = ["vibrant_anarkali.png", "electric_blue_lehanga.png", "neon_pink_kurti.png", "emerald_gown.png", "lavender_sharara.png", "maroon_velvet.png", "pastel_mint.png", "gold_suit.png"]
    lookbook_titles = ["Royal Zari Anarkali", "Mirror Work Lehanga", "Designer Pink Kurti", "Emerald Party Gown", "Lavender Sharara", "Maroon Velvet", "Mint Dhoti Set", "Gold Embroidered Suit"]
    lookbook_descs = ["Exquisite hand-woven silk.", "Artisan mirror work detailing.", "Modern silhouette, traditional craft.", "Velvet elegance for evenings.", "Organic cotton with threadwork.", "Statement festive velvet.", "Contemporary ethnic twist.", "Opulent Tussar silk."]

    for i in range(len(local_images)):
        payload = {
            "image_url": f"http://127.0.0.1:8000/uploads/{local_images[i]}",
            "title": lookbook_titles[i],
            "description": lookbook_descs[i]
        }
        try:
            res = requests.post(admin_url, json=payload, headers=headers)
            res.raise_for_status()
            print(f"Added {lookbook_titles[i]}")
        except Exception as e:
            print(f"Failed to add {lookbook_titles[i]}: {e}")

if __name__ == "__main__":
    token = login()
    if token:
        seed_lookbook(token)
    else:
        print("Could not get token. Is the server running at http://127.0.0.1:8000?")
