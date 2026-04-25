# Bunq Split

Bunq Split lets you split a restaurant bill with friends in seconds. Take a photo of your receipt, describe who had what, and the app automatically calculates each person's share and sends Bunq payment requests — no manual math, no awkward "who owes who" conversations.

Built at **Bunq Hackathon 7.0**.

---

## How to run locally

You will need two terminals — one for the backend, one for the frontend.

### Terminal 1 — Backend

```bash
cd backend

python -m venv .venv
.venv\Scripts\activate        # Mac/Linux: source .venv/bin/activate

pip install -r requirements.txt

cp .env.example .env
```

Open `.env` and fill in your `ANTHROPIC_API_KEY`, then:

```bash
uvicorn main:app --reload
```

Backend runs at **http://localhost:8000**.

### Terminal 2 — Frontend

```bash
cd frontend

npm install
npm run dev
```

Frontend runs at **http://localhost:3000**. Open that in your browser.

---

## Project structure

```
BunqHackathon/
├── frontend/    # Next.js (TypeScript, Tailwind CSS)
└── backend/     # FastAPI (Python)
```
