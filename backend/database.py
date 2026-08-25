import os
from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./boutique.db")

if SQLALCHEMY_DATABASE_URL and SQLALCHEMY_DATABASE_URL.startswith("postgres://"):
    SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgres://", "postgresql://", 1)

IS_SQLITE = SQLALCHEMY_DATABASE_URL.startswith("sqlite")

connect_args = {}
engine_kwargs = {}

if IS_SQLITE:
    connect_args = {"check_same_thread": False}
else:
    # Managed Postgres (Neon/Supabase) reaps idle connections. Without
    # pre_ping the first request after an idle period gets a dead socket;
    # recycling under the provider's idle timeout keeps the pool fresh.
    engine_kwargs = {
        "pool_pre_ping": True,
        "pool_recycle": 280,
        "pool_size": 5,
        "max_overflow": 5,
    }
    connect_args = {"connect_timeout": 10}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args, **engine_kwargs
)

@event.listens_for(Engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if IS_SQLITE:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL")
        cursor.execute("PRAGMA synchronous=NORMAL")
        cursor.execute("PRAGMA cache_size=-64000")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
