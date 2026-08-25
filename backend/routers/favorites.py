from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload, selectinload
from typing import List

import models, schemas
from database import get_db
from routers.auth import get_current_user

router = APIRouter(prefix="/api/favorites", tags=["Favorites"])

@router.get("", response_model=List[schemas.FavoriteResponse])
def get_favorites(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # This runs on every app load (the nav badge), so it must not lazy-load a
    # product plus its sizes per favorite.
    return db.query(models.Favorite).options(
        joinedload(models.Favorite.product).selectinload(models.Product.sizes)
    ).filter(models.Favorite.user_id == current_user.id).all()

@router.post("/toggle/{product_id}")
def toggle_favorite(product_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Check if product exists
    product = db.query(models.Product).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if already favorited
    favorite = db.query(models.Favorite).filter(
        models.Favorite.user_id == current_user.id,
        models.Favorite.product_id == product_id
    ).first()
    
    if favorite:
        db.delete(favorite)
        db.commit()
        return {"message": "Removed from favorites", "status": "removed"}
    else:
        new_favorite = models.Favorite(user_id=current_user.id, product_id=product_id)
        db.add(new_favorite)
        db.commit()
        return {"message": "Added to favorites", "status": "added"}
