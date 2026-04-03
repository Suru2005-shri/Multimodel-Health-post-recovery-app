"""
3-Hour Report Scheduler
Calls /api/reports/schedule/run every 3 hours.
Run alongside app.py:  python scheduler.py
"""
import time, requests, os, logging
from datetime import datetime

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(message)s")
logger = logging.getLogger(__name__)

API_BASE       = os.environ.get("API_BASE", "http://localhost:5000")
SCHEDULER_KEY  = os.environ.get("SCHEDULER_KEY", "schedule-key-2024")
INTERVAL_SEC   = int(os.environ.get("REPORT_INTERVAL", 10800))  # 3 hours

def run_reports():
    try:
        r = requests.post(
            f"{API_BASE}/api/reports/schedule/run",
            headers={"X-Scheduler-Key": SCHEDULER_KEY},
            timeout=30
        )
        data = r.json()
        logger.info(f"✅ Reports generated: {data.get('count',0)} | IDs: {data.get('generated',[])}")
    except Exception as e:
        logger.error(f"❌ Scheduler error: {e}")

if __name__ == "__main__":
    logger.info(f"🕐 Report scheduler started — interval: {INTERVAL_SEC//60} minutes")
    while True:
        run_reports()
        logger.info(f"⏱ Next report in {INTERVAL_SEC//60} minutes ({INTERVAL_SEC//3600}h)…")
        time.sleep(INTERVAL_SEC)
