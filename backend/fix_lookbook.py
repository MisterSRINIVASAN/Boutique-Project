import models
from database import SessionLocal, engine

# Ensure table exists
models.Base.metadata.create_all(bind=engine)

def fix():
    db = SessionLocal()
    # Clear existing lookbook
    db.query(models.LookbookItem).delete()
    db.commit()

    local_images = ["vibrant_anarkali.png", "electric_blue_lehanga.png", "neon_pink_kurti.png", "emerald_gown.png", "lavender_sharara.png", "maroon_velvet.png", "pastel_mint.png", "gold_suit.png"]
    lookbook_titles = ["Royal Zari Anarkali", "Mirror Work Lehanga", "Designer Pink Kurti", "Emerald Party Gown", "Lavender Sharara", "Maroon Velvet", "Mint Dhoti Set", "Gold Embroidered Suit"]
    lookbook_descs = ["Exquisite hand-woven silk.", "Artisan mirror work detailing.", "Modern silhouette, traditional craft.", "Velvet elegance for evenings.", "Organic cotton with threadwork.", "Statement festive velvet.", "Contemporary ethnic twist.", "Opulent Tussar silk."]

    for i in range(len(local_images)):
        lb_item = models.LookbookItem(
            image_url=f"http://127.0.0.1:8000/uploads/{local_images[i]}",
            title=lookbook_titles[i],
            description=lookbook_descs[i]
        )
        db.add(lb_item)
    db.commit()
    db.close()
    print("Lookbook fixed and seeded with 8 items!")

if __name__ == "__main__":
    fix()
