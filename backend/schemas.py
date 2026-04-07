from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class CategoryBase(BaseModel):
    name: str
    image_url: Optional[str] = None
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: str
    class Config:
        from_attributes = True

class ProductSizeBase(BaseModel):
    size_label: str
    chest: float
    waist: float
    hip: float
    stock: int
    note: Optional[str] = None

class ProductSizeCreate(ProductSizeBase):
    pass

class ProductSizeResponse(ProductSizeBase):
    id: str
    product_id: str
    class Config:
        from_attributes = True

from typing import List, Optional, Any

class ProductBase(BaseModel):
    id: str # allow manual ID assignment for products
    name: str
    fabric: str
    category_id: str
    base_description: str
    price: float
    images: Any

class ProductCreate(ProductBase):
    sizes: List[ProductSizeCreate]

class ProductResponse(ProductBase):
    sizes: List[ProductSizeResponse]
    category_obj: Optional[CategoryResponse] = None
    class Config:
        from_attributes = True

# --- Orders schemas ---

class OrderItemCreate(BaseModel):
    product_id: str
    size_label: str
    quantity: int

class OrderItemCreate(BaseModel):
    product_id: str
    size_label: str
    quantity: int

class OrderCreate(BaseModel):
    user_id: str
    address: str
    items: List[OrderItemCreate]

class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    size_label: str
    chest: float
    waist: float
    hip: float
    quantity: int
    price: float
    product: Optional[ProductBase] = None
    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: str
    user_id: str
    user_name: Optional[str] = None
    user_phone: Optional[str] = None
    total: float
    status: str
    dispatch_date: date
    address: str
    items: List[OrderItemResponse]
    class Config:
        from_attributes = True

class NotificationLogResponse(BaseModel):
    id: str
    order_id: str
    type: str # 'EMAIL' or 'SMS'
    recipient: str
    content: str
    timestamp: date
    class Config:
        from_attributes = True

# --- User schemas ---

class UserBase(BaseModel):
    name: str
    email: str
    address: Optional[str] = None
    phone_number: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(UserBase):
    id: str
    class Config:
        from_attributes = True

class LookbookItemBase(BaseModel):
    image_url: str
    title: str
    description: str

class LookbookItemCreate(LookbookItemBase):
    pass

class LookbookItemResponse(LookbookItemBase):
    id: str
    class Config:
        from_attributes = True

class FavoriteResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    product: ProductResponse
    class Config:
        from_attributes = True
