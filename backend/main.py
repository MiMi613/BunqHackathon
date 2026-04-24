from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="BunqHackathon API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "BunqHackathon API is running 🚀"}


@app.get("/api/hello")
def hello(name: str = "World"):
    return {"message": f"Hello, {name}! 👋"}


@app.get("/api/health")
def health():
    return {"status": "ok"}
