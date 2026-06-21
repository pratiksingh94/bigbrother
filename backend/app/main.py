from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from apscheduler.schedulers.background import BackgroundScheduler

from app.models.agent import Agent
from app.models.rule import Rule
from app.db import Base, engine, get_db, SessionLocal
from app.routes.agents import router as agent_router
from app.routes.events import router as event_router
from app.routes.detections import router as detection_router
from app.routes.rules import router as rules_router
from app.detection.run_detection import run_detection_engine


Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

app.include_router(agent_router, prefix="/agents", tags=["Agents"])
app.include_router(event_router, prefix="/events", tags=["Events"])
app.include_router(detection_router, prefix="/detections", tags=["Detections"])
app.include_router(rules_router, prefix="/rules", tags=["Rules"])


scheduler = BackgroundScheduler()
scheduler.add_job(run_detection_engine, "interval", seconds=30)
# scheduler.add_job(run_detection, "interval", seconds=30)
# scheduler.add_job(run_threshold_detection, "interval", seconds=30)
scheduler.start()


SUS_NAMES = {
    "nc",
    "netcat",
    "ncat",
    "tcpdump"
}

# seeding
# with SessionLocal() as db:
#     db.add(Rule(
#         name="Sus Process",
#         rule_type="match",
#         event_type="process.creation",
#         conditions={"field": "Name", "in": list(SUS_NAMES)},
#         severity="High"
#     ))
#     db.add(Rule(
#         name="SSH Bruteforce",
#         rule_type="threshold",
#         event_type="authentication.failure",
#         conditions={"group_by": "source_ip", "threshold": 3, "window_seconds": 60},
#         severity="High"
#     ))
#     db.commit()

@app.get("/")
def root():
    return {"message": "hello fellas :3"}