import psycopg

def init_db(url):
    try:
        with psycopg.connect(url) as conn:
            print("connected to database: ", conn.info.dbname)
            with conn.cursor() as curr:
                curr.execute("""
                CREATE TABLE IF NOT EXISTS agents (
                    id UUID PRIMARY KEY,
                    hostname TEXT NOT NULL,
                    os_name TEXT,
                    os_version TEXT,
                    status TEXT NOT NULL,
                    ip_address TEXT,

                    registered_at TIMESTAMP NOT NULL,
                    last_seen TIMESTAMP NOT NULL
                );
                """)
                
        
        
    except Exception as e:
        print("error while connecting to database:", e)