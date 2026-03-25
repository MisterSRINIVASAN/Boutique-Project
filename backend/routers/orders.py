from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date, timedelta
import uuid

import models, schemas
from database import get_db
from routers import auth
from services import notifications as notification_service

router = APIRouter(prefix="/api/orders", tags=["Orders"])

def generate_order_id():
    # Example: ORD-20260324-XXXX
    today = date.today().strftime("%Y%m%d")
    short_uuid = str(uuid.uuid4())[:4].upper()
    return f"ORD-{today}-{short_uuid}"

@router.post("", response_model=schemas.OrderResponse)
def create_order(order: schemas.OrderCreate, db: Session = Depends(get_db)):
    order_id = generate_order_id()
    
    # Calculate dispatch date (e.g., today + 25 days)
    # We could fetch this from Settings table, but hardcoded 25 for now
    dispatch_dt = date.today() + timedelta(days=25)
    
    db_order = models.Order(
        id=order_id,
        user_id=order.user_id,
        total=0,
        status="Order Placed - Tailoring Started",
        dispatch_date=dispatch_dt,
        address=order.address
    )
    db.add(db_order)
    
    total_price = 0
    # Process items
    for item in order.items:
        # Get product
        product = db.query(models.Product).filter(models.Product.id == item.product_id).first()
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {item.product_id} not found")
        
        # Get specific size measurements
        size_obj = db.query(models.ProductSize).filter(
            models.ProductSize.product_id == item.product_id,
            models.ProductSize.size_label == item.size_label
        ).first()
        
        if not size_obj:
            raise HTTPException(status_code=404, detail=f"Size {item.size_label} not found for product {item.product_id}")
            
        if size_obj.stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"Not enough stock for {product.name} Size {item.size_label}")
            
        # Deduct stock
        size_obj.stock -= item.quantity
        
        price = product.price * item.quantity
        total_price += price
        
        db_item = models.OrderItem(
            order_id=order_id,
            product_id=item.product_id,
            size_label=item.size_label,
            chest=size_obj.chest,
            waist=size_obj.waist,
            hip=size_obj.hip,
            quantity=item.quantity,
            price=price
        )
        db.add(db_item)
        
    db_order.total = total_price
    db.commit()
    db.refresh(db_order)
    
    # Fetch user for real details
    user_obj = db.query(models.User).filter(models.User.id == order.user_id).first()
    user_email = user_obj.email if user_obj else order.user_id
    user_phone = user_obj.phone_number if user_obj else "Unknown"

    # Trigger Professional Notifications (Email/SMS)
    notification_service.send_order_confirmation(db, db_order, user_obj)
    
    return db_order

@router.get("/mine", response_model=List[schemas.OrderResponse])
def get_my_orders(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    orders = db.query(models.Order).filter(models.Order.user_id == current_user.email).all()
    return orders

@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
