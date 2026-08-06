"""FastAPI-Einstiegspunkt: App-Instanz, Lifespan und Router-Registrierung."""

from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, status
from fastapi.encoders import jsonable_encoder
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from core.config import settings
from core.rate_limit import limiter
from database import run_migrations
from routers import auth, users, companies, job_postings, applications


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Bringt das DB-Schema per Alembic auf den neuesten Stand (siehe database.run_migrations)."""
    run_migrations()
    yield


app = FastAPI(
    title="Syntax-Bewerbungssammler API",
    description="API zur Verwaltung von Stellenbewerbungen",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.exception_handler(RequestValidationError)
async def validation_error_handler(_request: Request, exc: RequestValidationError):
    """Validierungsfehler (u.a. Registrierung/Login) als 400 mit strukturierten Feldfehlern."""
    return JSONResponse(
        status_code=status.HTTP_400_BAD_REQUEST,
        content={"detail": jsonable_encoder(exc.errors())},
    )


app.include_router(auth.router, prefix="/api")
app.include_router(users.router, prefix="/api")
app.include_router(companies.router, prefix="/api")
app.include_router(job_postings.router, prefix="/api")
app.include_router(applications.router, prefix="/api")


@app.get("/", tags=["Health"])
def health_check():
    """Einfacher Health-Check-Endpunkt."""
    return {"status": "ok", "service": "Bewerbungssammler API"}
