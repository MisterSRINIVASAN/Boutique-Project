import models
import uuid
import hashlib
from database import SessionLocal, engine

def generate_uuid():
    return str(uuid.uuid4())

models.Base.metadata.drop_all(bind=engine) # Clear old schema
models.Base.metadata.create_all(bind=engine)

def seed():
    db = SessionLocal()
    
    # Create Categories
    c_ethnic = models.Category(id=generate_uuid(), name="Ethnic")
    c_formal = models.Category(id=generate_uuid(), name="Formal")
    c_kurtis = models.Category(id=generate_uuid(), name="Kurtis")
    c_sets = models.Category(id=generate_uuid(), name="Kurti Sets")
    
    db.add_all([c_ethnic, c_formal, c_kurtis, c_sets])
    db.commit()

    # Create a Persistent Test User
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

    # Sample Products
    # Master list of diverse products (10 per category)
    # Master list of 40 diverse dress products (10 per category)
    # Guaranteed dress/ethnic IDs: 1617019173693-02f8dc748256, 1603227498424-699933cc42b2, 1583423250490-578f77626966, etc.
    products_data = [
        # ETHNIC
        {"name": "Royal Zari Anarkali", "fabric": "Silk Blend", "price": 4500, "img": "vibrant_anarkali.png"},
        {"name": "Banarasi Silk Saree", "fabric": "Pure Silk", "price": 7200, "img": "electric_blue_lehanga.png"},
        {"name": "Mirror Work Lehanga", "fabric": "Georgette", "price": 8900, "img": "neon_pink_kurti.png"},
        {"name": "Velvet Gota Patti", "fabric": "Velvet", "price": 5800, "img": "emerald_gown.png"},
        {"name": "Floral Organza Saree", "fabric": "Organza", "price": 3200, "img": "lavender_sharara.png"},
        {"name": "Bandhani Anarkali", "fabric": "Satin", "price": 4100, "img": "maroon_velvet.png"},
        {"name": "Lucknowi Chikankari", "fabric": "Fine Muslin", "price": 4800, "img": "pastel_mint.png"},
        {"name": "Chanderi Silk Set", "fabric": "Chanderi", "price": 5500, "img": "gold_suit.png"},
        {"name": "Patola Print Gown", "fabric": "Silk Fusion", "price": 6200, "img": "1614032002575-b6d814ec2f68"},
        {"name": "Kanjeevaram Fusion", "fabric": "Art Silk", "price": 6900, "img": "1618932260501-857e1dfd38a7"},

        # FORMAL
        {"name": "Midnight Satin Gown", "fabric": "Satin", "price": 3800, "img": "1518049363533-31422798c943"},
        {"name": "Champagne Slip Dress", "fabric": "Silk", "price": 2900, "img": "1496174972457-013fa1f3b3be"},
        {"name": "Emerald Velvet Wrap", "fabric": "Velvet", "price": 4200, "img": "1485467403339-da301ed00962"},
        {"name": "Sapphire Corset Dress", "fabric": "Crepe", "price": 5100, "img": "1492706602375-74d30537bf9b"},
        {"name": "Ruby Red Cocktail", "fabric": "Georgette", "price": 3400, "img": "1495333314421-df3d2e30bf42"},
        {"name": "Pearl White Bridal", "fabric": "Lace", "price": 9500, "img": "1494806812239-4604a7a02012"},
        {"name": "Onyx Blazer Dress", "fabric": "Tweed Blend", "price": 4600, "img": "1539109136881-3be0616acf4b"},
        {"name": "Silver Mist Tulle", "fabric": "Tulle", "price": 7800, "img": "1618932260501-857e1dfd38a7"},
        {"name": "Blush Pink A-Line", "fabric": "Chiffon", "price": 3100, "img": "1548611693-89030fd1921a"},
        {"name": "Crimson Sequin Maxi", "fabric": "Sequin", "price": 5400, "img": "1485968579580-b00ed41b5cf3"},

        # KURTIS
        {"name": "Indigo Batik Kurti", "fabric": "Cotton", "price": 1200, "img": "neon_pink_kurti.png"},
        {"name": "Saffron Slit Kurti", "fabric": "Rayon", "price": 1500, "img": "1613947493774-2c5e533b3780"},
        {"name": "Teal Peplum Kurti", "fabric": "Cambric", "price": 1800, "img": "1549439602-43ebcb2328af"},
        {"name": "Muted Olive Tunic", "fabric": "Linen", "price": 1100, "img": "1525507119028-ed4c629a60a3"},
        {"name": "Sunset Ombre Kurti", "fabric": "Mulberry Silk", "price": 2100, "img": "1485230895905-ec17bd36b5ec"},
        {"name": "Ivory Lace Kurti", "fabric": "Viscose", "price": 1600, "img": "1512436991641-6745cdb1723f"},
        {"name": "Mustard Floral Top", "fabric": "Chiffon", "price": 1300, "img": "1492707892479-7bc2d5a367d7"},
        {"name": "Azure Block Print", "fabric": "Hand-dyed cotton", "price": 1450, "img": "1469334031218-e382a71b716b"},
        {"name": "Coral Georgette", "fabric": "Georgette", "price": 1750, "img": "1532332248682-206cc786359f"},
        {"name": "Ebony Cotton Kurti", "fabric": "Slub Cotton", "price": 1250, "img": "1520006403909-838d6b92c22e"},

        # KURTI SETS
        {"name": "Pastel Palazzo Set", "fabric": "Jaipur Cotton", "price": 3200, "img": "vibrant_anarkali.png"},
        {"name": "Cigarette Pant Duo", "fabric": "Khadi Silk", "price": 3500, "img": "electric_blue_lehanga.png"},
        {"name": "Tulip Pant Ensemble", "fabric": "Chiffon Flex", "price": 3800, "img": "emerald_gown.png"},
        {"name": "Sharara Sky Blue", "fabric": "Satin Crepe", "price": 4200, "img": "lavender_sharara.png"},
        {"name": "Mint Dhoti Set", "fabric": "Modal", "price": 3600, "img": "pastel_mint.png"},
        {"name": "Rose Gold Combo", "fabric": "Lycra Silk", "price": 5100, "img": "neon_pink_kurti.png"},
        {"name": "Lavender Lounge Set", "fabric": "Organic Cotton", "price": 2800, "img": "vibrant_anarkali.png"},
        {"name": "Emerald Silk Suit", "fabric": "Banarasi Art Silk", "price": 6500, "img": "gold_suit.png"},
        {"name": "Maroon Velvet Set", "fabric": "Heavy Velvet", "price": 5900, "img": "maroon_velvet.png"},
        {"name": "Gold Embroidered", "fabric": "Tussar Silk", "price": 7200, "img": "gold_suit.png"},
    ]

    cats = [c_ethnic, c_formal, c_kurtis, c_sets]
    local_images = [
        "vibrant_anarkali.png", "electric_blue_lehanga.png", "neon_pink_kurti.png",
        "emerald_gown.png", "lavender_sharara.png", "maroon_velvet.png",
        "pastel_mint.png", "gold_suit.png"
    ]
    
    for i, data in enumerate(products_data):
        cat = cats[i // 10]
        prod_id = f"P{200 + i}"
        
        # Use local images in a circular fashion for 100% guaranteed coverage
        img_name = local_images[i % len(local_images)]
        img_url = f"http://127.0.0.1:8000/uploads/{img_name}"
        
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
        
        # Add a few common sizes for each
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

    print(f"Database seeded successfully with products and Lookbook items!")

if __name__ == "__main__":
    seed()
