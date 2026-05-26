from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from fastapi_cache.decorator import cache

import models, schemas
from database import get_db

router = APIRouter(prefix="/api/products", tags=["Products"])

@router.get("", response_model=schemas.PaginatedProductResponse)
@cache(expire=300)
def get_products(
    category_id: Optional[str] = None, 
    sort_by: Optional[str] = "popular",
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    query = db.query(models.Product).options(
        joinedload(models.Product.category_obj),
        joinedload(models.Product.sizes)
    )
    if category_id:
        query = query.filter(models.Product.category_id == category_id)
        
    if sort_by == "price-asc":
        query = query.order_by(models.Product.price.asc())
    elif sort_by == "price-desc":
        query = query.order_by(models.Product.price.desc())
    elif sort_by == "new":
        query = query.order_by(models.Product.id.desc())
        
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    
    return {"total": total, "items": items}

@router.get("/categories", response_model=List[schemas.CategoryResponse])
@cache(expire=300)
def get_categories(db: Session = Depends(get_db)):
    return db.query(models.Category).all()

@router.get("/{product_id}", response_model=schemas.ProductResponse)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(models.Product).options(
        joinedload(models.Product.category_obj),
        joinedload(models.Product.sizes)
    ).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.get("/lookbook/all", response_model=List[schemas.LookbookItemResponse])
@cache(expire=300)
def get_lookbook_public(db: Session = Depends(get_db)):
    return db.query(models.LookbookItem).all()
