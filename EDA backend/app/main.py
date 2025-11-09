from fastapi import FastAPI,status
from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any, Callable
from .models import FMCGData,User,UserRole
from .schemas import FMCGOut
from .database import get_db

from .fmcg import router as fmcg_router
from .users import router as users_router
from .database import Base, engine

from .schemas import UserResponse,UserLogin,CreateUser,Token

# Create tables on startup (good for dev, in prod use Alembic migrations)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="EDA FMCG API")

# Allow frontend (Vite) requests
origins = [
    '*',
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://eda-app-gcsn.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # or ["*"] in dev mode
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(fmcg_router, prefix="/api", tags=["FMCG"])
app.include_router(users_router, tags=["Users"])

@app.get("/")
def root():
    return {"hello": "world"}
