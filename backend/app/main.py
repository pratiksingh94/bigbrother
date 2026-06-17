from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apscheduler.schedulers.background import BackgroundScheduler

from app.models.agent import Agent
from app.db import Base, engine, get_db
from app.routes.agents import router as agent_router
from app.routes.events import router as event_router
from app.routes.detections import router as detection_router
from app.detection.run_detection import run_detection


Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(agent_router, prefix="/agents", tags=["Agents"])
app.include_router(event_router, prefix="/events", tags=["Events"])
app.include_router(detection_router, prefix="/detections", tags=["Detections"])


scheduler = BackgroundScheduler()
scheduler.add_job(run_detection, "interval", seconds=30)
scheduler.start()

@app.get("/")
def root():
    return {"message": "hello fellas :3"}