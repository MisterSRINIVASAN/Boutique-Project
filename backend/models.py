from sqlalchemy import Column, String, Integer, Float, ForeignKey, Text, JSON, Date
from datetime import date
from sqlalchemy.orm import relationship
import uuid
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    address = Column(Text)
    phone_number = Column(String)
    orders = relationship("Order", back_populates="user")

class Category(Base):
    __tablename__ = "categories"
    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, index=True)
    image_url = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    products = relationship("Product", back_populates="category_obj")

class Product(Base):
    __tablename__ = "products"
    id = Column(String, primary_key=True) # e.g., P101
    name = Column(String)
    fabric = Column(String)
    category_id = Column(String, ForeignKey("categories.id")) # Link to dynamic category
    base_description = Column(Text)
    price = Column(Float)
    images = Column(JSON) # List of image URLs
    
    category_obj = relationship("Category", back_populates="products")
    sizes = relationship("ProductSize", back_populates="product", cascade="all, delete-orphan")

class ProductSize(Base):
    __tablename__ = "product_sizes"
    id = Column(String, primary_key=True, default=generate_uuid)
    product_id = Column(String, ForeignKey("products.id"))
    size_label = Column(String) # e.g., '38'
    chest = Column(Float)
    waist = Column(Float)
    hip = Column(Float)
    stock = Column(Integer, default=0)
    note = Column(String) # e.g., 'Best for slim fit'
    
    product = relationship("Product", back_populates="sizes")

class Order(Base):
    __tablename__ = "orders"
    id = Column(String, primary_key=True) # e.g., ORD-20260324-XXXX
    user_id = Column(String, ForeignKey("users.id"))
    total = Column(Float)
    status = Column(String, default="Order Placed")
    dispatch_date = Column(Date)
    address = Column(Text)
    
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")

    @property
    def user_name(self):
        return self.user.name if self.user else "Guest"

    @property
    def user_phone(self):
        return self.user.phone_number if self.user else "N/A"

class Favorite(Base):
    __tablename__ = "favorites"
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    product_id = Column(String, ForeignKey("products.id"))
    
    user = relationship("User", backref="favorites")
    product = relationship("Product")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String, ForeignKey("orders.id"))
    product_id = Column(String, ForeignKey("products.id"))
    size_label = Column(String)
    chest = Column(Float)
    waist = Column(Float)
    hip = Column(Float)
    quantity = Column(Integer, default=1)
    price = Column(Float)

    order = relationship("Order", back_populates="items")
    product = relationship("Product")

class Settings(Base):
    __tablename__ = "settings"
    key = Column(String, primary_key=True)
    value = Column(String)

class NotificationLog(Base):
    __tablename__ = "notification_logs"
    id = Column(String, primary_key=True, default=generate_uuid)
    order_id = Column(String)
    type = Column(String) # 'EMAIL' or 'SMS'
    recipient = Column(String)
    content = Column(String)
    timestamp = Column(Date, default=date.today)

class LookbookItem(Base):
    __tablename__ = "lookbook"
    id = Column(String, primary_key=True, default=generate_uuid)
    image_url = Column(String)
    title = Column(String)
    description = Column(Text)
