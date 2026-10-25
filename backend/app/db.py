import os
import time

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.exc import OperationalError
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import Session, sessionmaker

load_dotenv()
DATABASE_URL = os.environ["DATABASE_URL"]

engine = create_engine(DATABASE_URL)

Base = declarative_base()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    with Session(engine) as ses:
        yield ses


def wait_for_database(engine, attempts: int = 30, delay: float = 1.0) -> None:
    for attempt in range(attempts):
        try:
            with engine.connect():
                return
        except OperationalError:
            if attempt == attempts - 1:
                raise
            time.sleep(delay)
