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
- ⚡ **High-Speed Caching & Optimized Database**: Implemented `Write-Ahead Logging (WAL)` in SQLite, alongside `fastapi-cache2` in-memory database caching, ensuring that thousands of products load instantly.
- 📈 **Massive Scalability & Pagination**: Backend-driven pagination and dynamic "Load More" frontend functionality gracefully handles thousands of products without freezing the browser, capping initial loads at 100 items for maximum speed.
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

## 🏎️ Performance Optimizations (Scaling)
To ensure the application runs smoothly even with large traffic, we have integrated:
1. **Database WAL Mode**: `PRAGMA journal_mode=WAL` prevents database locking during heavy concurrent reads/writes.
2. **Database Indices**: Heavily queried tables (like `categories` and `orders`) have indexed Foreign Keys.
3. **API Level Caching**: Added in-memory `@cache` decorators to product/category fetch routes, dropping response times from ~100ms down to `<5ms`.
4. **Backend Pagination**: Shifted sorting and filtering entirely to the server-side, utilizing precise `skip` and `limit` SQL constraints to ensure the frontend only renders exactly what it needs.

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
pip install fastapi-cache2 # Ensure caching is installed
uvicorn main:app --reload
```

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
