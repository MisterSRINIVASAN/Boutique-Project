import sys
import os
from sqlalchemy.orm import Session
from database import SessionLocal, engine
import models
from dotenv import load_dotenv

# Load .env if it exists (for local or manual remote seeding)
load_dotenv()

def fix_lookbook():
    db = SessionLocal()
    try:
        print("--- Boutique Lookbook Repair Script ---")
        
        # 1. Clear existing lookbook table to prevent duplicates/garbage
        print("Clearing existing lookbook table...")
        db.query(models.LookbookItem).delete()
        db.commit()

        # 2. Define High-Quality Stable Images (Unsplash)
        stable_lookbook = [
            { "image_url": "https://images.unsplash.com/photo-1583391733958-d259c1b3f9ff?auto=format&fit=crop&q=80&w=1000", "title": "Royal Zari Anarkali", "description": "Exquisite hand-woven silk with traditional zari work." },
            { "image_url": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1000", "title": "Mirror Work Lehanga", "description": "Electric blue georgette with artisan mirror accents." },
            { "image_url": "https://images.unsplash.com/photo-1596455607563-ad6193f76b17?auto=format&fit=crop&q=80&w=1000", "title": "Designer Pink Kurti", "description": "Modern silhouette meets traditional craft." },
            { "image_url": "https://images.unsplash.com/photo-1518049363533-31422798c943?auto=format&fit=crop&q=80&w=1000", "title": "Emerald Party Gown", "description": "Rich velvet drape for evening elegance." },
            { "image_url": "https://images.unsplash.com/photo-1621213328299-4d9609c2a713?auto=format&fit=crop&q=80&w=1000", "title": "Lavender Sharara Set", "description": "Delicate organic cotton with intricate threadwork." },
            { "image_url": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=1000", "title": "Maroon Velvet Ensemble", "description": "Luxurious heavy velvet for a festive statement." },
            { "image_url": "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&q=80&w=1000", "title": "Pastel Mint Dhoti Set", "description": "Contemporary twist on a classic ethnic silhouette." },
            { "image_url": "https://images.unsplash.com/photo-1589156206699-bc21e38c8a7d?auto=format&fit=crop&q=80&w=1000", "title": "Gold Embroidered Suit", "description": "Tussar silk with opulent golden embroidery." }
        ]

        print(f"Inserting {len(stable_lookbook)} stable items...")
        for data in stable_lookbook:
            item = models.LookbookItem(
                image_url=data["image_url"],
                title=data["title"],
                description=data["description"]
            )
            db.add(item)
        
        db.commit()
        print("✅ SUCCESS: Lookbook table populated with stable cloud-safe links!")
        
    except Exception as e:
        print(f"❌ ERROR: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_lookbook()
