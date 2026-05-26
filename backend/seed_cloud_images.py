import sys
from sqlalchemy.orm import Session
from database import SessionLocal
import models
from dotenv import load_dotenv

load_dotenv()

images = {
    "Ethnic": "https://images.unsplash.com/photo-1583391733958-d259c1b3f9ff?q=80&w=1000&auto=format&fit=crop",
    "Formal": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop",
    "Kurtis": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop",
    "Kurti Sets": "https://images.unsplash.com/photo-1596455607563-ad6193f76b17?q=80&w=1000&auto=format&fit=crop"
}

images_updated = {
    "Ethnic": "https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=800",
    "Kurti Sets": "https://images.pexels.com/photos/1055691/pexels-photo-1055691.jpeg?auto=compress&cs=tinysrgb&w=800",
    "Formal": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=1000&auto=format&fit=crop",
    "Kurtis": "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop"
}

def main():
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
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
