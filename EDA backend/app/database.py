from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# DATABASE_URL = "postgresql://postgres:parameshpalo@localhost:5432/eda_app"
DATABASE_URL = "postgresql://postgres:pGSwjTCucSUoBeKTJObZmLrYwkoDUrZm@shortline.proxy.rlwy.net:37544/railway"

engine = create_engine(DATABASE_URL, pool_pre_ping=True, future=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)
Base = declarative_base()

# Dependency for FastAPI routes
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
