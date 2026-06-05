# 📦 Inventory & Order Management System

A full-stack Inventory & Order Management System built with **FastAPI**, **React**, and **PostgreSQL**, fully containerized with Docker.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11, FastAPI |
| Frontend | React 18, React Router |
| Database | PostgreSQL 15 |
| Containerization | Docker, Docker Compose |
| Web Server | Nginx (frontend) |

## ✅ Features

- **Product Management** — CRUD with unique SKU enforcement, stock tracking, categories
- **Customer Management** — CRUD with unique email enforcement
- **Order Management** — Create orders with multiple items, auto stock reduction, cancel with stock restore
- **Business Rules** — Insufficient stock prevention, auto total calculation, negative stock prevention
- **Dashboard** — Live stats: total products, customers, orders, low-stock alerts (≤10 units)

---

## 🚀 Quick Start (Local with Docker)

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/inventory-system.git
cd inventory-system

# 2. Create your .env file
cp .env.example .env
# Edit .env and set a secure POSTGRES_PASSWORD

# 3. Build and run
docker-compose up --build

# 4. Open in browser
# Frontend: http://localhost
# Backend API docs: http://localhost:8000/docs
```

---

## 📁 Project Structure

```
inventory-system/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py        # Settings via env vars
│   │   │   └── database.py      # SQLAlchemy setup
│   │   ├── models/
│   │   │   └── models.py        # Product, Customer, Order, OrderItem
│   │   ├── schemas/
│   │   │   └── schemas.py       # Pydantic request/response models
│   │   ├── routers/
│   │   │   ├── products.py      # /products endpoints
│   │   │   ├── customers.py     # /customers endpoints
│   │   │   ├── orders.py        # /orders endpoints (with business logic)
│   │   │   └── dashboard.py     # /dashboard/stats
│   │   └── main.py              # FastAPI app entry point
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/client.js        # Axios API client
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Products.js
│   │   │   ├── Customers.js
│   │   │   └── Orders.js
│   │   ├── App.js
│   │   └── index.js
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🔌 API Endpoints

### Products
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products/` | List all products |
| POST | `/products/` | Create product |
| GET | `/products/{id}` | Get product by ID |
| PUT | `/products/{id}` | Update product |
| DELETE | `/products/{id}` | Delete product |

### Customers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers/` | List all customers |
| POST | `/customers/` | Create customer |
| GET | `/customers/{id}` | Get customer by ID |
| DELETE | `/customers/{id}` | Delete customer |

### Orders
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/orders/` | List all orders |
| POST | `/orders/` | Create order (reduces stock) |
| GET | `/orders/{id}` | Get order details |
| DELETE | `/orders/{id}` | Cancel order (restores stock) |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard/stats` | Summary stats + low stock |

---

## ☁️ Deployment Guide

### Backend → Render

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Python 3
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   - `DATABASE_URL` → your PostgreSQL connection string (use Render Postgres or Railway)
   - `ALLOWED_ORIGINS` → your Vercel frontend URL

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Settings:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
4. Add environment variable:
   - `REACT_APP_API_URL` → your Render backend URL (e.g. `https://your-app.onrender.com`)

### Database → Render or Railway

For Render: New → PostgreSQL (free tier)
For Railway: New Project → Add PostgreSQL

Copy the connection string to your backend's `DATABASE_URL`.

---

## 🐳 Docker Hub

To push your backend image:

```bash
docker build -t yourusername/inventory-backend:latest ./backend
docker push yourusername/inventory-backend:latest
```

---

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `POSTGRES_USER` | DB username | `postgres` |
| `POSTGRES_PASSWORD` | DB password | *(required)* |
| `POSTGRES_DB` | DB name | `inventory_db` |
| `DATABASE_URL` | Full DB connection string | auto-built |
| `REACT_APP_API_URL` | Backend API URL for frontend | `http://localhost:8000` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost` |

---

## 📖 Business Rules Implemented

1. **Unique SKU** — Creating a product with a duplicate SKU returns HTTP 400
2. **Unique Email** — Creating a customer with a duplicate email returns HTTP 400
3. **No Negative Stock** — Stock quantity cannot be set below 0
4. **Insufficient Stock** — Order creation fails with HTTP 400 if any item exceeds available stock
5. **Auto Stock Reduction** — Creating an order automatically decrements each product's stock
6. **Stock Restore on Cancel** — Deleting/cancelling an order restores all product stock
7. **Auto Total Calculation** — Order total is calculated by the backend from current product prices

