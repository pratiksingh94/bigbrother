import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apscheduler.schedulers.background import BackgroundScheduler

from app.db import Base, SessionLocal, engine, wait_for_database
from app.detection.engine import run_detection_engine
from app.routes.agents import router as agent_router
from app.routes.detections import router as detection_router
from app.routes.events import router as event_router
from app.routes.health import router as health_router
from app.routes.rules import router as rules_router
from app.seeding import seed_default_rules


wait_for_database(engine)
Base.metadata.create_all(bind=engine)

with SessionLocal() as db:
    seed_default_rules(db)

app = FastAPI()

cors_origins = [
    origin.strip()
    for origin in os.environ.get("CORS_ORIGINS", "http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, tags=["System"])
app.include_router(agent_router, prefix="/agents", tags=["Agents"])
app.include_router(event_router, prefix="/events", tags=["Events"])
app.include_router(detection_router, prefix="/detections", tags=["Detections"])
app.include_router(rules_router, prefix="/rules", tags=["Rules"])


scheduler = BackgroundScheduler()
scheduler.add_job(run_detection_engine, "interval", seconds=30)
scheduler.start()
