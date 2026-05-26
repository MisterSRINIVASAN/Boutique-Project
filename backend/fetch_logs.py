from dotenv import load_dotenv
import os

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

from database import SessionLocal
import models

def get_logs():
    db = SessionLocal()
    try:
        logs = db.query(models.NotificationLog).filter(models.NotificationLog.type=="EMAIL").order_by(models.NotificationLog.id.desc()).limit(5).all()
        for log in logs:
            print(f"[{log.order_id}] {log.content[:150]}")
    finally:
        db.close()

if __name__ == "__main__":
    get_logs()
