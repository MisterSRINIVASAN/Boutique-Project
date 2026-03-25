from fastapi import APIRouter, Depends, HTTPException, File, UploadFile
from sqlalchemy.orm import Session
from typing import List
import os
import uuid
import cloudinary
import cloudinary.uploader
import cloudinary.api
from dotenv import load_dotenv

load_dotenv()

cloudinary.config(
  cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
  api_key=os.getenv("CLOUDINARY_API_KEY"),
  api_secret=os.getenv("CLOUDINARY_API_SECRET")
)
import models, schemas
from database import get_db
from routers.auth import get_current_admin

router = APIRouter(
    prefix="/api/admin",
    tags=["Admin"],
    dependencies=[Depends(get_current_admin)]
)

@router.post("/products", response_model=schemas.ProductResponse)
def create_product(product: schemas.ProductCreate, db: Session = Depends(get_db)):
    db_product = models.Product(
        id=product.id,
        name=product.name,
        fabric=product.fabric,
        category_id=product.category_id,
        base_description=product.base_description,
        price=product.price,
        images=product.images
    )
    db.add(db_product)
    
    for size in product.sizes:
        db_size = models.ProductSize(
            product_id=product.id,
            size_label=size.size_label,
            chest=size.chest,
            waist=size.waist,
            hip=size.hip,
            stock=size.stock,
            note=size.note
        )
        db.add(db_size)
    
    db.commit()
    db.refresh(db_product)
    return db_product

@router.get("/categories", response_model=List[schemas.CategoryResponse])
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()

@router.post("/categories", response_model=schemas.CategoryResponse)
def create_category(category: schemas.CategoryCreate, db: Session = Depends(get_db)):
    db_category = models.Category(name=category.name)
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

from sqlalchemy.orm import joinedload

@router.get("/inventory")
def get_inventory(db: Session = Depends(get_db)):
    # Fetch all inventory items with their related product details
    inventory = db.query(models.ProductSize).options(joinedload(models.ProductSize.product)).all()
    return inventory

@router.get("/orders", response_model=List[schemas.OrderResponse])
def get_all_orders(db: Session = Depends(get_db)):
    return db.query(models.Order).order_by(models.Order.id.desc()).all()

@router.post("/orders/{order_id}/dispatch", response_model=schemas.OrderResponse)
def mark_order_dispatched(order_id: str, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = "Dispatched - Out for Delivery"
    db.commit()
    db.refresh(order)
    
    # Trigger dispatch notification
    from services import notifications as notification_service
    notification_service.send_order_confirmation(db, order, order.user) # We can reuse or specialize this
    
    return order

@router.get("/lookbook", response_model=List[schemas.LookbookItemResponse])
def get_lookbook_admin(db: Session = Depends(get_db)):
    return db.query(models.LookbookItem).all()

@router.post("/lookbook", response_model=schemas.LookbookItemResponse)
def create_lookbook_item(item: schemas.LookbookItemCreate, db: Session = Depends(get_db)):
    db_item = models.LookbookItem(**item.model_dump())
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item

@router.delete("/lookbook/{item_id}")
def delete_lookbook_item(item_id: str, db: Session = Depends(get_db)):
    db_item = db.query(models.LookbookItem).filter(models.LookbookItem.id == item_id).first()
    if not db_item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(db_item)
    db.commit()
    return {"message": "Item deleted"}

@router.get("/notifications", response_model=List[schemas.NotificationLogResponse])
def get_notifications(db: Session = Depends(get_db)):
    return db.query(models.NotificationLog).order_by(models.NotificationLog.timestamp.desc()).all()

@router.post("/upload")
async def upload_images(files: List[UploadFile] = File(...)):
    uploaded_urls = []
    for file in files:
        # Upload the file directly to Cloudinary
        result = cloudinary.uploader.upload(file.file)
        uploaded_urls.append(result["secure_url"])
    
    return {"urls": uploaded_urls}
