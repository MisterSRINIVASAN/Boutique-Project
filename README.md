<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=21&height=250&section=header&text=Attire%20Destination&fontSize=80&fontAlignY=35&desc=Modern%20Boutique%20E-Commerce%20Platform&descAlignY=55&descAlign=62&fontColor=ffffff" alt="Attire Destination Header" width="100%"/>
</div>

<div align="center">
  
  [![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=FastAPI&logoColor=white)](https://fastapi.tiangolo.com/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/index.html)
  [![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=Cloudinary&logoColor=white)](https://cloudinary.com/)
</div>

---

## ✨ About The Project
**Attire Destination** is a fully functional, premium boutique clothing e-commerce platform. It boasts a stunning, vibrant glassmorphism design that provides an immersive shopping experience. The platform seamlessly integrates a modern React frontend with a highly optimized FastAPI backend, enabling blazing-fast product discovery, cart management, and seamless order processing.

---

## 🚀 Special Features

- 🎨 **Vibrant UI & Glassmorphism Aesthetics**: Built meticulously with Tailwind CSS to offer a visually appealing experience with smooth gradients, blurs, and hover micro-animations.
- ⚡ **High-Speed Caching**: `fastapi-cache2` in-memory response caching and HTTP `stale-while-revalidate` headers on the server, TanStack Query on the client, plus SQLite `Write-Ahead Logging` for local development.
- 📈 **Massive Scalability & Pagination**: Backend-driven pagination with a "Load More" grid handles thousands of products without freezing the browser, keeping the first page small (24 items) so the storefront paints quickly.
- 🛍️ **Interactive Lookbook**: Dedicated interactive lookbook component for displaying fashion models and outfit inspirations.
- 🔒 **Role-Based Authentication**: Secure JWT-based authentication for both regular Users and Admin roles.
- 🛒 **Advanced Cart & Favorites Management**: Real-time context-based cart management, favorite product toggling, and robust size/stock tracking per item.
- 📦 **Admin Dashboard**: Comprehensive admin dashboard for uploading products, managing sizes, creating dynamic categories, and overseeing user orders.

---

## 📂 Project Structure

```text
Boutique_Project/
├── backend/
│   ├── routers/         # API Route handlers (auth, products, orders, admin)
│   ├── services/        # Business logic and external integrations
│   ├── uploads/         # Local image storage
│   ├── main.py          # FastAPI application entry point
│   ├── database.py      # Database connection & setup (SQLite WAL enabled)
│   ├── models.py        # SQLAlchemy DB models & Indexes
│   ├── schemas.py       # Pydantic validation schemas
│   └── requirements.txt # Python dependencies
├── frontend/
│   ├── public/          # Static assets
│   ├── src/
│   │   ├── components/  # React UI Components (Homepage, AdminDashboard, etc.)
│   │   ├── context/     # React Context (Auth, Cart, Favorites)
│   │   ├── App.jsx      # Main React application routing
│   │   ├── main.jsx     # React DOM rendering entry
│   │   └── index.css    # Global TailwindCSS styles & vibrant UI configs
│   ├── package.json     # NPM dependencies
│   └── vite.config.js   # Vite build configuration
└── README.md            # Project Documentation
```

---

## 🛠️ Technology Stack

| Domain | Technology | Use Case |
| ------ | ---------- | -------- |
| **Frontend** | React (Vite), Tailwind CSS | Dynamic user interface, vibrant styling, responsive UI |
| **Backend** | Python, FastAPI | High-performance RESTful API endpoints |
| **Database** | SQLite + SQLAlchemy (WAL Mode enabled) | Lightweight, highly optimized relational database management |
| **Storage** | Cloudinary / Local Uploads | Product image hosting and management |
| **Caching** | `fastapi-cache2` (InMemory) | Extremely fast API response rendering |

---

## 🏎️ Performance Optimizations

### Backend
1. **Working API cache**: `@cache` routes use a custom key builder (`cache_utils.py`). The default builder stringifies every argument including the injected SQLAlchemy `Session`, whose `object at 0x...` repr changes per request — so the cache wrote a new entry on every call and never read one back. Cached endpoints also return validated, JSON-safe primitives, so a hit skips the ORM entirely.
2. **No N+1 queries**: `/api/admin/orders`, `/api/orders/mine` and `/api/favorites` eager-load their nested relationships. Previously each order lazy-loaded its user, its items, and a product per item.
3. **Lean grid payload**: the product list returns only the fields a card renders (`ProductListItemResponse`), not full descriptions, measurements and a nested category object.
4. **Stable pagination**: every sort order ends on `product.id`. Without a total ordering, Postgres could repeat or skip rows across `LIMIT/OFFSET` pages.
5. **Cheap counts + price index**: pagination totals use a dedicated `COUNT` instead of re-running the eager-loaded query; `products.price` is indexed for price sorts.
6. **HTTP caching**: public catalogue responses send `Cache-Control: public, max-age=60, stale-while-revalidate=300`; authenticated routes send `no-store`.
7. **Connection pooling**: Postgres uses `pool_pre_ping` and connection recycling so idle-reaped connections don't stall the first request after a quiet period.
8. **Faster cold starts**: `create_all()` is gated behind `RUN_MIGRATIONS=1` instead of reflecting every table on each boot. SQLite keeps it on by default.
9. **Database WAL Mode** (SQLite): `PRAGMA journal_mode=WAL` prevents locking during concurrent reads/writes.

### Frontend
1. **TanStack Query**: shared cache, request deduplication and background revalidation. Navigating Home → Product → Home no longer refetches the catalogue.
2. **Hover prefetch**: hovering a product card warms its detail-page query, so the click usually renders from cache.
3. **No duplicate requests**: the homepage previously fired `/api/products` twice per visit, because its fetch effect depended on the categories state it also awaited. Categories and products now load in parallel.
4. **Font chain broken**: fonts are `<link>`-ed from `index.html` with preconnects rather than `@import`-ed from CSS, which delayed discovery until the stylesheet had parsed.
5. **Eager landing route**: `Homepage` is bundled with the entry chunk; the other twelve routes stay lazy.
6. **Right-sized images**: images are requested at the size their slot actually uses, the first row loads eagerly with `fetchpriority="high"`, and the rest lazily. Intrinsic `width`/`height` prevent layout shift.
7. **Client-side collection links**: the homepage collection tiles used raw `<a href>`, which reloaded the entire document instead of routing.
8. **Composited background**: the ambient blur blobs are promoted to their own compositor layers, so a full-screen blur is rasterized once instead of repainting on every scroll and animation frame. Motion respects `prefers-reduced-motion`.
9. **Stable context values**: the Auth/Cart/Favorites providers memoise their values, so a change in one no longer re-renders every product card.
10. **Build splitting**: React and TanStack Query sit in separate long-cached vendor chunks; `/assets/*` is served `immutable` for a year.
11. **Smaller first page**: the grid loads 24 products and pages in more on demand, rather than rendering 100 up front.

---

## 🔮 Future Implementations

- [ ] **Payment Gateway Integration**: Integrate Stripe or Razorpay for seamless real-time transaction processing.
- [ ] **AI-Based Recommendations**: Implement machine learning models to recommend outfits based on users' purchase history and saved items.
- [ ] **PostgreSQL Migration**: Easily transition from SQLite to a managed PostgreSQL cluster (e.g., Supabase or AWS RDS) for massive scale.
- [ ] **Email & SMS Notifications**: Auto-dispatch SMS and Email tracking updates to customers when their order status changes.
- [ ] **Content Delivery Network (CDN)**: Serve frontend assets and Cloudinary images entirely through a global CDN edge for instantaneous loading worldwide.

---

## ⚙️ Setup & Installation

### 1. Quick Start (Windows)
We have provided an automated startup script! Just double click the `run_all.bat` file in the root directory. It will automatically launch both the backend API and the frontend interface in separate windows!

### 2. Manual Backend Setup
```bash
cd backend
python -m venv venv
# Activate the virtual environment
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
uvicorn main:app --reload
```

**Deploying against Postgres**: table creation is skipped by default to keep cold
starts fast. Boot once with `RUN_MIGRATIONS=1` against a fresh database (and
after any change to `models.py`), then unset it. The `products.price` index is
new — `create_all()` will not add an index to a table that already exists, so
run `CREATE INDEX IF NOT EXISTS ix_products_price ON products (price);` once on
an existing database.

### 3. Manual Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### 3. Environment Variables
Create a `.env` file in the `backend/` directory using the `.env.example` format (ensure you have Cloudinary details configured if deploying).

---

<div align="center">
  <p><i>Crafted with ❤️ for modern fashion e-commerce.</i></p>
</div>
