from fastapi import FastAPI
from .database.session import engine
from .models.task import Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Todo Application API", version="1.0.0")

@app.get("/")
def read_root():
    return {"message": "Welcome to the Todo Application API"}