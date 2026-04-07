from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
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
def create_order(order: schemas.OrderCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    try:
        # 1. Resolve User (Frontend might send ID or Email)
        user_obj = db.query(models.User).filter(
            (models.User.id == order.user_id) | (models.User.email == order.user_id)
        ).first()
        
        if not user_obj:
            raise HTTPException(status_code=404, detail=f"User {order.user_id} not found. Please log in again.")
            
        real_user_id = user_obj.id
        order_id = generate_order_id()
        
        # Calculate dispatch date (e.g., today + 25 days)
        dispatch_dt = date.today() + timedelta(days=25)
        
        db_order = models.Order(
            id=order_id,
            user_id=real_user_id, # Use the resolved UUID
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
        
        # Trigger Professional Notifications (Email/SMS) in Background
        background_tasks.add_task(
            notification_service.send_order_confirmation_background,
            order_id, real_user_id
        )
        
        return db_order

    except HTTPException as he:
        raise he
    except Exception as e:
        import traceback
        print(f"❌ [ORDER ERROR] Critical failure creating order: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/mine", response_model=List[schemas.OrderResponse])
def get_my_orders(current_user: models.User = Depends(auth.get_current_user), db: Session = Depends(get_db)):
    try:
        orders = db.query(models.Order).filter(models.Order.user_id == current_user.id).all()
        return orders
    except Exception as e:
        print(f"❌ [ORDER ERROR] Error fetching user orders: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/{order_id}", response_model=schemas.OrderResponse)
def get_order(order_id: str, db: Session = Depends(get_db)):
    order = db.query(models.Order).filter(models.Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order
