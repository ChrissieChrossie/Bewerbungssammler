from fastapi import FastAPI
from contextlib import asynccontextmanager

from database import engine, Base
from routers import users, companies, job_postings, applications


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Tabellen beim Start anlegen (für lokale Entwicklung / SQLite)
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="Syntax-Bewerbungssammler API",
    description="API zur Verwaltung von Stellenbewerbungen",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(users.router)
app.include_router(companies.router)
app.include_router(job_postings.router)
app.include_router(applications.router)


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "service": "Bewerbungssammler API"}
