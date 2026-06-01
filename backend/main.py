from dotenv import load_dotenv
from utils.db import init_db
import os

load_dotenv()


init_db(os.environ["DATABASE_URL"])