import hashlib
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import models, schemas
from database import get_db

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# Simple oauth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

ADMIN_TOKEN = "super_secret_admin_token"

def hash_password(password: str):
    return hashlib.sha256(password.encode()).hexdigest()

@router.post("/register", response_model=schemas.UserResponse)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_user = models.User(
        name=user.name,
        email=user.email,
        password_hash=hash_password(user.password),
        address=user.address,
        phone_number=user.phone_number
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 1. Check Admin
    if form_data.username == "admin" and form_data.password == "admin123":
        return {"access_token": ADMIN_TOKEN, "token_type": "bearer", "role": "admin"}
    
    # 2. Check User
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if user and user.password_hash == hash_password(form_data.password):
        # We use user ID as a simple token for this demonstration
        return {"access_token": user.id, "token_type": "bearer", "role": "user", "user": user}
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password",
        headers={"WWW-Authenticate": "Bearer"},
    )

def get_current_admin(token: str = Depends(oauth2_scheme)):
    if token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Admin access required")
    return True

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.id == token).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found or invalid session")
    return user
