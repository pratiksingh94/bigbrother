from fastapi import FastAPI

from app.models.agent import Agent
from app.db import Base, engine
from app.routes.agents import router as agent_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(agent_router, prefix="/agents", tags=["Agents", "lilbro"])


@app.get("/")
def root():
    return {"message": "hello fellas :3"}