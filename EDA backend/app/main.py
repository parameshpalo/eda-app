from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .fmcg import router as fmcg_router
from .database import Base, engine

# Create tables on startup (good for dev, in prod use Alembic migrations)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="EDA FMCG API")

# Allow frontend (Vite) requests
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://eda-app-gcsn.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,   # or ["*"] in dev mode
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(fmcg_router, prefix="/api", tags=["FMCG"])

@app.get("/")
def root():
    return {"hello": "world"}
