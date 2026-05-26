from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker


# AM RULAT DE PE POWERSHELL python init_db.py

# Postgres:admin@localhost:5435/proiect_vd_db
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:123456@localhost:5435/proiect_vd_db"
# conectarea la baza de date PostgreSQL folosind SQLAlchemy
engine = create_engine(SQLALCHEMY_DATABASE_URL)
# crearea unei sesiuni pentru interactiunea cu baza de date
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()