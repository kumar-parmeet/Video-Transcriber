import os, psycopg

def conn():
    return psycopg.connect(host=os.getenv('PGHOST'), port=os.getenv('PGPORT'), user=os.getenv('PGUSER'),
                           password=os.getenv('PGPASSWORD'), dbname=os.getenv('PGDATABASE'))
