# InvenTrack — Inventory & Order Management System

A full-stack Inventory & Order Management System built with **FastAPI**, **React + Vite**, and **PostgreSQL**.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11-blue.svg)
![React](https://img.shields.io/badge/react-19-61DAFB.svg)

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
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Frontend | React 19, Vite, React Router, Axios |
| Database | PostgreSQL 15 |
| Styling | Vanilla CSS (custom design system) |
| Icons | Lucide React |
| Infrastructure | Docker, Docker Compose |
| Deployment | Render (API), Vercel (UI), Neon (DB) |

---

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- PostgreSQL 15+ (or Docker)

### Option 1: Docker Compose (Recommended)

```bash
# Clone the repository
git clone https://github.com/Siddharthydv01/Inventory-Order-Management.git
cd Inventory-Order-Management

# Start all services
docker-compose up --build
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Docs (Swagger)**: http://localhost:8000/docs

### Option 2: Local Development

**Backend:**

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

pip install -r requirements.txt

# Start the API server
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory_db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Health check |
| GET | `/api/products/` | List all products |
| POST | `/api/products/` | Create product |
| GET | `/api/products/{id}` | Get product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |
| GET | `/api/customers/` | List all customers |
| POST | `/api/customers/` | Create customer |
| GET | `/api/customers/{id}` | Get customer |
| PUT | `/api/customers/{id}` | Update customer |
| DELETE | `/api/customers/{id}` | Delete customer |
| GET | `/api/orders/` | List all orders |
| POST | `/api/orders/` | Create order |
| GET | `/api/orders/{id}` | Get order |

---

## Deployment

### Backend → Render

1. Create a new **Web Service** on [Render](https://render.com).
2. Connect your GitHub repository.
3. Set **Root Directory** to `backend`.
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables: `DATABASE_URL`, `CORS_ORIGINS`.

### Frontend → Vercel

1. Import the project on [Vercel](https://vercel.com).
2. Set **Root Directory** to `frontend`.
3. Set **Build Command**: `npm run build`
4. Set **Output Directory**: `dist`
5. Add environment variable: `VITE_API_URL=https://your-render-backend.onrender.com/api`

### Database → Neon

1. Create a project on [Neon](https://neon.tech).
2. Copy the connection string.
3. Set it as `DATABASE_URL` in your Render environment variables.

---

## Project Structure

```
├── backend/
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── config.py        # Settings
│   │   ├── database.py      # SQLAlchemy setup
│   │   ├── models.py        # ORM models
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── routers/
│   │       ├── products.py
│   │       ├── customers.py
│   │       └── orders.py
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/client.js
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── index.css
│   ├── Dockerfile
│   └── vercel.json
├── docker-compose.yml
├── render.yaml
├── .env.example
└── README.md
```

---

## License

MIT

---

## Repository

- **GitHub:** https://github.com/Siddharthydv01/Inventory-Order-Management.git
- **Push a tag:**

```bash
# create a tag (example)
git tag v1.0.0
git push origin v1.0.0
```