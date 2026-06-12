# InvenTrack — Inventory & Order Management System

A full-stack Inventory & Order Management System built with **FastAPI**, **React + Vite**, and **PostgreSQL**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11-blue.svg)
![React](https://img.shields.io/badge/react-19-61DAFB.svg)

---

## 🚀 Live Deployment

| Component | URL |
|-----------|-----|
| **Frontend** | https://frontend-rose-one-14.vercel.app |
| **Backend API** | https://inventory-api-qjm4.onrender.com/api |
| **GitHub Repository** | https://github.com/Siddharthydv01/Inventory-Order-Management |
| **Docker Image** | https://hub.docker.com/r/siddharthydv/inventory-order-backend |

---

## Features

- **Products Management** — Full CRUD with unique SKU enforcement and stock tracking
- **Customer Directory** — Full CRUD with unique email validation
- **Order Processing** — Create orders with automatic stock validation and decrement
- **Dashboard** — Real-time overview with stats, recent orders, and low-stock alerts
- **Responsive UI** — Dark-mode glassmorphism design, works on desktop and mobile

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | FastAPI 0.115.0, SQLAlchemy 2.0, Pydantic 2.9 |
| **Frontend** | React 19, Vite, React Router, Axios |
| **Database** | PostgreSQL 15 (Render) |
| **Styling** | Vanilla CSS (custom design system) |
| **Icons** | Lucide React |
| **Containerization** | Docker, Docker Hub |
| **Deployment** | Render (Backend), Vercel (Frontend) |

---

## Project Structure

```
Inventory-Order-Management/
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── config.py
│       ├── database.py
│       ├── models.py
│       ├── schemas.py
│       └── routers/
│           ├── products.py
│           ├── customers.py
│           └── orders.py
│
├── frontend/
│   ├── Dockerfile
│   ├── vite.config.js
│   ├── vercel.json
│   ├── package.json
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── api/
│       │   └── client.js
│       ├── components/
│       │   ├── Layout.jsx
│       │   ├── DataTable.jsx
│       │   ├── Modal.jsx
│       │   ├── Sidebar.jsx
│       │   └── StatusBadge.jsx
│       └── pages/
│           ├── Dashboard.jsx
│           ├── Products.jsx
│           ├── Customers.jsx
│           └── Orders.jsx
│
├── .github/
│   └── workflows/
│       └── docker-publish.yml
│
└── README.md
```

---

## Quick Start (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 15+ (or Docker)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://user:password@localhost/inventory_db"
export CORS_ORIGINS="http://localhost:5173"

# Run migrations and start server
uvicorn app.main:app --reload
```

Backend runs on `http://localhost:8000`

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set environment variable
export VITE_API_URL="http://localhost:8000/api"

# Start development server
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Docker Deployment

### Build Backend Image

```bash
docker build -t siddharthydv/inventory-order-backend:latest -f backend/Dockerfile backend/
docker tag siddharthydv/inventory-order-backend:latest siddharthydv/inventory-order-backend:v1.0.0
```

### Push to Docker Hub

```bash
docker push siddharthydv/inventory-order-backend:latest
docker push siddharthydv/inventory-order-backend:v1.0.0
```

### Pull and Run

```bash
docker pull siddharthydv/inventory-order-backend:latest
docker run -p 8000:8000 \
  -e DATABASE_URL="postgresql://..." \
  -e CORS_ORIGINS="https://your-frontend-url" \
  siddharthydv/inventory-order-backend:latest
```

---

## API Endpoints

### Products
- `GET /api/products/` - List all products (with search)
- `GET /api/products/{id}` - Get product by ID
- `POST /api/products/` - Create new product
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Customers
- `GET /api/customers/` - List all customers (with search)
- `GET /api/customers/{id}` - Get customer by ID
- `POST /api/customers/` - Create new customer
- `PUT /api/customers/{id}` - Update customer
- `DELETE /api/customers/{id}` - Delete customer

### Orders
- `GET /api/orders/` - List all orders (with pagination)
- `GET /api/orders/{id}` - Get order by ID
- `POST /api/orders/` - Create new order
- `PUT /api/orders/{id}` - Update order status
- `DELETE /api/orders/{id}` - Delete order

---

## Environment Variables

### Backend
```env
DATABASE_URL=postgresql://inventory_db_my9r_user:WZbmWV2wEYTvHYnozJQhSElDGB2T9fkJ@dpg-d8lv516q1p3s739tlupg-a/inventory_db_my9r
CORS_ORIGINS=https://frontend-rose-one-14.vercel.app
```

### Frontend
```env
VITE_API_URL=https://inventory-api-qjm4.onrender.com/api
```

---

## CI/CD Pipeline

GitHub Actions workflow automatically builds and pushes Docker images on every push to `main` branch.

**Workflow file:** `.github/workflows/docker-publish.yml`

**Required Secrets:**
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

---

## Database Schema

### Products Table
- `id` (UUID, Primary Key)
- `sku` (String, Unique)
- `name` (String)
- `description` (Text)
- `price` (Decimal)
- `stock_quantity` (Integer)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Customers Table
- `id` (UUID, Primary Key)
- `name` (String)
- `email` (String, Unique)
- `phone` (String)
- `address` (Text)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Orders Table
- `id` (UUID, Primary Key)
- `customer_id` (UUID, Foreign Key)
- `order_date` (Timestamp)
- `status` (Enum: pending, processing, shipped, delivered, cancelled)
- `total_amount` (Decimal)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### Order Items Table
- `id` (UUID, Primary Key)
- `order_id` (UUID, Foreign Key)
- `product_id` (UUID, Foreign Key)
- `quantity` (Integer)
- `unit_price` (Decimal)
- `created_at` (Timestamp)

---

## License

This project is licensed under the **MIT License** — see LICENSE file for details.

---

## Author

**Siddharth Yadav**  
GitHub: [@Siddharthydv01](https://github.com/Siddharthydv01)

---

## Support

For issues, questions, or contributions, please open an issue on the [GitHub repository](https://github.com/Siddharthydv01/Inventory-Order-Management).