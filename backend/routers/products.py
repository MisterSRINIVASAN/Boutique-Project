from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload, selectinload
from typing import List, Optional
from fastapi_cache.decorator import cache

import models, schemas
from cache_utils import query_key_builder
from database import get_db

router = APIRouter(prefix="/api/products", tags=["Products"])


def as_json(model):
    """Return plain JSON-safe primitives.

    fastapi-cache encodes whatever the endpoint returns. SQLAlchemy ORM objects
    are not JSON-serializable, so cached endpoints must hand back validated,
    already-flattened data -- which also means a cache hit skips the ORM
    entirely instead of re-walking the object graph.
    """
    return model.model_dump(mode="json")


@router.get("", response_model=schemas.PaginatedProductListResponse)
@cache(expire=300, key_builder=query_key_builder)
def get_products(
    category_id: Optional[str] = None,
    sort_by: Optional[str] = "popular",
    skip: int = 0,
    limit: int = 24,
    db: Session = Depends(get_db)
):
    # selectinload issues one extra query for all sizes instead of multiplying
    # product rows by their size count the way a join would.
    query = db.query(models.Product).options(selectinload(models.Product.sizes))
    count_query = select(func.count()).select_from(models.Product)

    if category_id:
        query = query.filter(models.Product.category_id == category_id)
        count_query = count_query.where(models.Product.category_id == category_id)

    # Every sort ends on product id so LIMIT/OFFSET paging stays stable --
    # without a total ordering Postgres may repeat or skip rows across pages.
    if sort_by == "price-asc":
        query = query.order_by(models.Product.price.asc(), models.Product.id)
    elif sort_by == "price-desc":
        query = query.order_by(models.Product.price.desc(), models.Product.id)
    elif sort_by == "new":
        query = query.order_by(models.Product.id.desc())
    else:
        query = query.order_by(models.Product.id)

    total = db.execute(count_query).scalar_one()
    items = query.offset(skip).limit(limit).all()

    return as_json(schemas.PaginatedProductListResponse(total=total, items=items))

@router.get("/categories", response_model=List[schemas.CategoryResponse])
@cache(expire=300, key_builder=query_key_builder)
def get_categories(db: Session = Depends(get_db)):
    rows = db.query(models.Category).order_by(models.Category.name).all()
    return [as_json(schemas.CategoryResponse.model_validate(r)) for r in rows]

@router.get("/lookbook/all", response_model=List[schemas.LookbookItemResponse])
@cache(expire=300, key_builder=query_key_builder)
def get_lookbook_public(db: Session = Depends(get_db)):
    rows = db.query(models.LookbookItem).all()
    return [as_json(schemas.LookbookItemResponse.model_validate(r)) for r in rows]

@router.get("/{product_id}", response_model=schemas.ProductResponse)
@cache(expire=300, key_builder=query_key_builder)
def get_product(product_id: str, db: Session = Depends(get_db)):
    product = db.query(models.Product).options(
        joinedload(models.Product.category_obj),
        selectinload(models.Product.sizes)
    ).filter(models.Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return as_json(schemas.ProductResponse.model_validate(product))
