from dotenv import load_dotenv
import os

# Load .env first before anything else!
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from database import engine
from sqlalchemy import text
from sqlalchemy.orm import Session
from database import SessionLocal
import models

def patch_remote_db():
    print(f"Connecting to: {engine.url}")
    with engine.connect() as conn:
        try:
            conn.execute(text("ALTER TABLE categories ADD COLUMN description VARCHAR;"))
            conn.commit()
            print("Successfully added description column to categories table!")
        except Exception as e:
            print(f"Column might already exist or error: {e}")

images_updated = {
    "Ethnic": "https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=800",
    "Kurti Sets": "https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=800",
    "Formal": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop",
    "Kurtis": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop"
}

def seed_images():
    db = SessionLocal()
    try:
        updated = 0
        categories = db.query(models.Category).all()
        for cat in categories:
            if cat.name in images_updated:
                print(f"Updating {cat.name}...")
                cat.image_url = images_updated[cat.name]
                updated += 1
        db.commit()
        print(f"Categories updated successfully! (Total: {updated})")
    except Exception as e:
        print(f"Error seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    patch_remote_db()
    seed_images()
