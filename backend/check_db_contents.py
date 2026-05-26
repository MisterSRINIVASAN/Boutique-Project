import os
from dotenv import load_dotenv

load_dotenv()

from sqlalchemy import create_engine
import models
url = os.getenv("DATABASE_URL")
engine = create_engine(url)

with engine.connect() as conn:
    print("Database connected successfully!")
    # Count products
    result = conn.execute(models.Product.__table__.select())
    products = result.fetchall()
    print(f"Products loaded: {len(products)}")
    
    # Count categories
    result = conn.execute(models.Category.__table__.select())
    categories = result.fetchall()
    print(f"Categories loaded: {len(categories)}")

