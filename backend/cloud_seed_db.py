import os
import uuid
import hashlib
import cloudinary
import cloudinary.uploader
from dotenv import load_dotenv

# Load env first
load_dotenv()

import models
from database import SessionLocal, engine

# Configure Cloudinary
cloudinary.config(
  cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
  api_key=os.getenv("CLOUDINARY_API_KEY"),
  api_secret=os.getenv("CLOUDINARY_API_SECRET")
)

def generate_uuid():
    return str(uuid.uuid4())

print("Resetting remote database schema...")
models.Base.metadata.drop_all(bind=engine)
models.Base.metadata.create_all(bind=engine)

def seed():
    # 1. Image Migration to Cloudinary
    local_images = [
        "vibrant_anarkali.png", "electric_blue_lehanga.png", "neon_pink_kurti.png",
        "emerald_gown.png", "lavender_sharara.png", "maroon_velvet.png",
        "pastel_mint.png", "gold_suit.png"
    ]
    
    uploaded_urls = {}
    print("Uploading images to Cloudinary (this might take a minute)...")
    for img in local_images:
        path = os.path.join("uploads", img)
        if os.path.exists(path):
            print(f"Uploading {img}...")
            result = cloudinary.uploader.upload(path)
            uploaded_urls[img] = result["secure_url"]
        else:
            print(f"Warning: Local image {path} not found. Skipping...")
            uploaded_urls[img] = "https://via.placeholder.com/400x500.png?text=Missing+Image"

    # 2. Seeding Database
    print("Seeding remote Neon database...")
    db = SessionLocal()
    
    # Categories
    c_ethnic = models.Category(id=generate_uuid(), name="Ethnic")
    c_formal = models.Category(id=generate_uuid(), name="Formal")
    c_kurtis = models.Category(id=generate_uuid(), name="Kurtis")
    c_sets = models.Category(id=generate_uuid(), name="Kurti Sets")
    db.add_all([c_ethnic, c_formal, c_kurtis, c_sets])
    db.commit()

    # User
    test_user = models.User(
        id=generate_uuid(),
        name="Test User",
        email="test@example.com",
        password_hash=hashlib.sha256("password123".encode()).hexdigest(),
        address="123 Boutique Lane, Designer District",
        phone_number="9988776655"
    )
    db.add(test_user)
    db.commit()

    products_data = [
        # ETHNIC
        {"name": "Royal Zari Anarkali", "fabric": "Silk Blend", "price": 4500},
        {"name": "Banarasi Silk Saree", "fabric": "Pure Silk", "price": 7200},
        {"name": "Mirror Work Lehanga", "fabric": "Georgette", "price": 8900},
        {"name": "Velvet Gota Patti", "fabric": "Velvet", "price": 5800},
        {"name": "Floral Organza Saree", "fabric": "Organza", "price": 3200},
        {"name": "Bandhani Anarkali", "fabric": "Satin", "price": 4100},
        {"name": "Lucknowi Chikankari", "fabric": "Fine Muslin", "price": 4800},
        {"name": "Chanderi Silk Set", "fabric": "Chanderi", "price": 5500},
        {"name": "Patola Print Gown", "fabric": "Silk Fusion", "price": 6200},
        {"name": "Kanjeevaram Fusion", "fabric": "Art Silk", "price": 6900},

        # FORMAL
        {"name": "Midnight Satin Gown", "fabric": "Satin", "price": 3800},
        {"name": "Champagne Slip Dress", "fabric": "Silk", "price": 2900},
        {"name": "Emerald Velvet Wrap", "fabric": "Velvet", "price": 4200},
        {"name": "Sapphire Corset Dress", "fabric": "Crepe", "price": 5100},
        {"name": "Ruby Red Cocktail", "fabric": "Georgette", "price": 3400},
        {"name": "Pearl White Bridal", "fabric": "Lace", "price": 9500},
        {"name": "Onyx Blazer Dress", "fabric": "Tweed Blend", "price": 4600},
        {"name": "Silver Mist Tulle", "fabric": "Tulle", "price": 7800},
        {"name": "Blush Pink A-Line", "fabric": "Chiffon", "price": 3100},
        {"name": "Crimson Sequin Maxi", "fabric": "Sequin", "price": 5400},

        # KURTIS
        {"name": "Indigo Batik Kurti", "fabric": "Cotton", "price": 1200},
        {"name": "Saffron Slit Kurti", "fabric": "Rayon", "price": 1500},
        {"name": "Teal Peplum Kurti", "fabric": "Cambric", "price": 1800},
        {"name": "Muted Olive Tunic", "fabric": "Linen", "price": 1100},
        {"name": "Sunset Ombre Kurti", "fabric": "Mulberry Silk", "price": 2100},
        {"name": "Ivory Lace Kurti", "fabric": "Viscose", "price": 1600},
        {"name": "Mustard Floral Top", "fabric": "Chiffon", "price": 1300},
        {"name": "Azure Block Print", "fabric": "Hand-dyed cotton", "price": 1450},
        {"name": "Coral Georgette", "fabric": "Georgette", "price": 1750},
        {"name": "Ebony Cotton Kurti", "fabric": "Slub Cotton", "price": 1250},

        # KURTI SETS
        {"name": "Pastel Palazzo Set", "fabric": "Jaipur Cotton", "price": 3200},
        {"name": "Cigarette Pant Duo", "fabric": "Khadi Silk", "price": 3500},
        {"name": "Tulip Pant Ensemble", "fabric": "Chiffon Flex", "price": 3800},
        {"name": "Sharara Sky Blue", "fabric": "Satin Crepe", "price": 4200},
        {"name": "Mint Dhoti Set", "fabric": "Modal", "price": 3600},
        {"name": "Rose Gold Combo", "fabric": "Lycra Silk", "price": 5100},
        {"name": "Lavender Lounge Set", "fabric": "Organic Cotton", "price": 2800},
        {"name": "Emerald Silk Suit", "fabric": "Banarasi Art Silk", "price": 6500},
        {"name": "Maroon Velvet Set", "fabric": "Heavy Velvet", "price": 5900},
        {"name": "Gold Embroidered", "fabric": "Tussar Silk", "price": 7200},
    ]

    cats = [c_ethnic, c_formal, c_kurtis, c_sets]
    
    for i, data in enumerate(products_data):
        cat = cats[i // 10]
        prod_id = f"P{200 + i}"
        
        # Pull Cloudinary URL mapped from local images
        img_name = local_images[i % len(local_images)]
        img_url = uploaded_urls[img_name]
        
        p = models.Product(
            id=prod_id,
            name=data["name"],
            fabric=data["fabric"],
            category_id=cat.id,
            base_description=f"Exquisite {data['name']} crafted from {data['fabric']}. A hallmark of the Attire By Sush premium collection.",
            price=data["price"],
            images=[img_url]
        )
        db.add(p)
        db.commit()
        
        for label, size_val in [("S", 36), ("M", 38), ("L", 40)]:
            stock_count = 10 if i % 3 == 0 else 5
            s = models.ProductSize(
                product_id=prod_id,
                size_label=label,
                chest=size_val,
                waist=size_val-4,
                hip=size_val+2,
                stock=stock_count,
                note="Standard Fit"
            )
            db.add(s)
        db.commit()

    # --- Seed Lookbook ---
    lookbook_titles = ["Royal Zari Anarkali", "Mirror Work Lehanga", "Designer Pink Kurti", "Emerald Party Gown", "Lavender Sharara", "Maroon Velvet", "Mint Dhoti Set", "Gold Embroidered Suit"]
    lookbook_descs = ["Exquisite hand-woven silk.", "Artisan mirror work detailing.", "Modern silhouette, traditional craft.", "Velvet elegance for evenings.", "Organic cotton with threadwork.", "Statement festive velvet.", "Contemporary ethnic twist.", "Opulent Tussar silk."]

    for i in range(len(local_images)):
        img_name = local_images[i]
        lb_item = models.LookbookItem(
            image_url=uploaded_urls[img_name],
            title=lookbook_titles[i],
            description=lookbook_descs[i]
        )
        db.add(lb_item)
    db.commit()

    print(f"Neon Database and Cloudinary fully seeded successfully!")

if __name__ == "__main__":
    seed()
