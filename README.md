# BunqHackathon

Repository for our team at Bunq Hackathon 7.0.

A full-stack template with a **Next.js** (TypeScript + Tailwind CSS) frontend and a **FastAPI (Python)** backend.

---

## Project Structure

```
BunqHackathon/
├── frontend/          # Next.js app (TypeScript, Tailwind CSS, App Router)
└── backend/           # Python API (FastAPI)
```

---

## Getting Started

### 1. Backend (Python / FastAPI)

```bash
cd backend

# (Optional) create a virtual environment
python3 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the dev server (auto-reload on changes)
uvicorn main:app --reload
```

The API will be available at **http://localhost:8000**.  
Interactive docs (Swagger UI) → **http://localhost:8000/docs**

### 2. Frontend (Next.js)

```bash
cd frontend

# Copy env file and edit if needed
cp .env.local.example .env.local

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The frontend will be available at **http://localhost:3000**.

---

## Key Endpoints

| Method | Path            | Description                  |
|--------|-----------------|------------------------------|
| GET    | `/`             | API root / status message    |
| GET    | `/api/hello`    | Returns a personalised greeting (`?name=`) |
| GET    | `/api/health`   | Health check                 |
| GET    | `/docs`         | Swagger / OpenAPI UI         |

---

## Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | Next.js 16, TypeScript, Tailwind  |
| Backend   | Python 3, FastAPI, Uvicorn        |
