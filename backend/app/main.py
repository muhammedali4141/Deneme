from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from .db import Base, engine
from .routers import assets, assignments, tickets, users

app = FastAPI(title="IT Envanter & Ticketing Web App", version="0.2.0")

Base.metadata.create_all(bind=engine)

app.include_router(users.router)
app.include_router(assets.router)
app.include_router(assignments.router)
app.include_router(tickets.router)

static_dir = Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
def index():
    return FileResponse(static_dir / "index.html")


@app.get("/health")
def health_check():
    return {"status": "ok"}
