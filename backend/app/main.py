from fastapi import FastAPI

from .db import Base, engine
from .routers import assets, assignments, tickets, users

app = FastAPI(title="IT Envanter & Ticketing API", version="0.1.0")

Base.metadata.create_all(bind=engine)

app.include_router(users.router)
app.include_router(assets.router)
app.include_router(assignments.router)
app.include_router(tickets.router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
