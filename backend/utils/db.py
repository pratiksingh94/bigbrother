import psycopg

def init_db(url):
    try:
        conn = psycopg.connect(url)
        
        print("connected to database")
    except Exception as e:
        print("error while connecting to database:", e)