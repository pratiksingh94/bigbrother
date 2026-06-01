from fastapi import FastAPI

from app.models.agent import Agent
from app.db import Base, engine

Base.metadata.create_all(bind=engine)

app = FastAPI()

@app.get("/")
def root():
    return {"message": "hello fellas :3"}