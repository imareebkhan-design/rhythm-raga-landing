import os
import json
from datetime import datetime
from typing import Dict, Any
from google_ads.models.campaign import AuditRecord

class AuditLogger:
    """
    Saves structured, timestamped audit records for full campaign generation history and auditability.
    """

    LOG_DIR = "logs"

    @classmethod
    def log(cls, audit_record: AuditRecord) -> str:
        """
        Writes AuditRecord as a JSON artifact in the logs directory.
        Returns filepath of created audit log.
        """
        if not os.path.exists(cls.LOG_DIR):
            os.makedirs(cls.LOG_DIR, exist_ok=True)

        ts_str = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
        filename = f"campaign_audit_{ts_str}.json"
        filepath = os.path.join(cls.LOG_DIR, filename)

        try:
            with open(filepath, "w", encoding="utf-8") as f:
                json.dump(audit_record.to_dict(), f, indent=2)
            return filepath
        except Exception as e:
            print(f"⚠️ Failed to write audit log file: {e}")
            return ""
