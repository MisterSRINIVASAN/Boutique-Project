from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
import os
import models
from database import engine, IS_SQLITE
from fastapi_cache import FastAPICache
from fastapi_cache.backends.inmemory import InMemoryBackend

# create_all reflects every table -- a round trip each against a remote DB, on
# the critical path of every cold start. Local SQLite keeps it on for
# convenience; on Postgres, run it deliberately with RUN_MIGRATIONS=1 (needed
# once against a fresh database, and after any model change).
if os.getenv("RUN_MIGRATIONS", "1" if IS_SQLITE else "0") == "1":
    models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Attire Destination API", description="Boutique Clothing Platform Backend")

# Compression Middleware
app.add_middleware(GZipMiddleware, minimum_size=500)

# CORS Configuration
origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True if origins[0] != "*" else False,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"], # Allow all for now to maximize compatibility
)


# Public catalogue data is identical for every visitor, so let the browser (and
# any CDN in front of the API) reuse it instead of refetching on every
# back-navigation. Everything user-specific stays uncacheable.
PUBLIC_CACHE = "public, max-age=60, stale-while-revalidate=300"

@app.middleware("http")
async def add_cache_headers(request: Request, call_next):
    response = await call_next(request)
    if request.method == "GET" and response.status_code == 200:
        path = request.url.path
        if path.startswith("/api/products"):
            response.headers["Cache-Control"] = PUBLIC_CACHE
        elif path.startswith("/uploads/"):
            response.headers["Cache-Control"] = "public, max-age=86400"
        elif path.startswith("/api/"):
            response.headers["Cache-Control"] = "no-store"
    return response

# Ensure uploads directory exists
uploads_dir = os.path.join(os.path.dirname(__file__), "uploads")
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)

app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

from routers import admin, products, orders, auth, favorites

app.include_router(auth.router)
app.include_router(admin.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(favorites.router)

@app.on_event("startup")
async def startup():
    FastAPICache.init(InMemoryBackend())

@app.get("/")
def read_root():
    return {"message": "Welcome to Attire Destination API"}

@app.get("/api/health")
def health():
    """Cheap endpoint for uptime pings that keep the instance warm."""
    return {"status": "ok"}
