from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.models.agent import Agent
from app.db import Base, engine
from app.routes.agents import router as agent_router

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(agent_router, prefix="/agents", tags=["Agents", "lilbro"])


@app.get("/")
def root():
    return {"message": "hello fellas :3"}