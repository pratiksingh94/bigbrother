import os
from dotenv import load_dotenv
from fastapi import FastAPI

from utils.db import init_db

load_dotenv()


init_db(os.environ["DATABASE_URL"])

app = FastAPI()

@app.get("/")
def root():
    return {"message": "hello fellas :3"}