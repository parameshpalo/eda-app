from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .fmcg import router as fmcg_router
from .database import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI(title="EDA FMCG API")

# Allow frontend (Vite) requests
origins = [
    "http://localhost:5173",  # frontend
    "http://127.0.0.1:5173",  # sometimes vite uses this
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # or ["*"] to allow all
    allow_credentials=True,
    allow_methods=["*"],         # allow all HTTP methods
    allow_headers=["*"],         # allow all headers
)


app.include_router(fmcg_router, prefix="/api", tags=["FMCG"])

@app.get('/')
def root():
    return {'hello': ' world'}