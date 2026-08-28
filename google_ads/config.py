import os
import json
import urllib.request
import urllib.parse
from typing import Dict, Any, Optional

def load_dotenv(env_path: str = ".env") -> None:
    """Simple parser for .env file if python-dotenv is not installed."""
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    key = key.strip()
                    val = val.strip().strip("'").strip('"')
                    os.environ[key] = val

# Load .env file automatically on import
load_dotenv()

class Config:
    """Centralized configuration for the Google Ads Campaign Launcher."""

    # API Settings - Default to v25 (configurable via GOOGLE_ADS_API_VERSION)
    API_VERSION: str = os.getenv("GOOGLE_ADS_API_VERSION", "v25")
    BASE_URL: str = f"https://googleads.googleapis.com/{API_VERSION}"

    # Auth Credentials
    DEVELOPER_TOKEN: str = os.getenv("GOOGLE_ADS_DEVELOPER_TOKEN", "").strip()
    CLIENT_ID: str = os.getenv("GOOGLE_ADS_CLIENT_ID", "").strip()
    CLIENT_SECRET: str = os.getenv("GOOGLE_ADS_CLIENT_SECRET", "").strip()
    REFRESH_TOKEN: str = os.getenv("GOOGLE_ADS_REFRESH_TOKEN", "").strip()
    CUSTOMER_ID: str = os.getenv("GOOGLE_ADS_CUSTOMER_ID", "").replace("-", "").strip()
    LOGIN_CUSTOMER_ID: str = os.getenv("GOOGLE_ADS_LOGIN_CUSTOMER_ID", "").replace("-", "").strip()

    # Default Targetings
    DEFAULT_GEO_TARGET: str = os.getenv("DEFAULT_LOCATION", "1007788")  # Delhi, India
    DEFAULT_LANGUAGE: str = os.getenv("DEFAULT_LANGUAGE", "1000")       # English
    DEFAULT_NETWORK: str = os.getenv("DEFAULT_NETWORK", "GOOGLE_SEARCH")
    DEFAULT_BUDGET: float = float(os.getenv("DEFAULT_BUDGET", "1000.0"))

    # Bidding & Thresholds
    DEFAULT_BIDDING_STRATEGY: str = os.getenv("DEFAULT_BIDDING_STRATEGY", "MANUAL_CPC")
    MIN_KEYWORD_SCORE: float = float(os.getenv("MIN_KEYWORD_SCORE", "40.0"))
    MIN_SEARCH_VOLUME: int = int(os.getenv("MIN_SEARCH_VOLUME", "0"))
    MAX_CPC: float = float(os.getenv("MAX_CPC", "200.0"))

    # Match Types
    ENABLE_EXACT_MATCH: bool = os.getenv("ENABLE_EXACT_MATCH", "true").lower() == "true"
    ENABLE_PHRASE_MATCH: bool = os.getenv("ENABLE_PHRASE_MATCH", "true").lower() == "true"
    ENABLE_BROAD_MATCH: bool = os.getenv("ENABLE_BROAD_MATCH", "false").lower() == "true"

    # Execution Mode
    ENABLE_LIVE_LAUNCH: bool = os.getenv("ENABLE_LIVE_LAUNCH", "false").lower() == "true"
    DEFAULT_DRY_RUN: bool = os.getenv("DEFAULT_DRY_RUN", "true").lower() == "true"

    # RSA Customization
    HEADLINE_PINNING_MODE: str = os.getenv("HEADLINE_PINNING_MODE", "HEADLINE_1_EXACT")

    # Scoring Weights (Total = 1.0)
    WEIGHT_INTENT: float = 0.35
    WEIGHT_LOCATION: float = 0.20
    WEIGHT_COMMERCIAL: float = 0.15
    WEIGHT_VOLUME: float = 0.15
    WEIGHT_COMPETITION: float = 0.10
    WEIGHT_SPECIFICITY: float = 0.05

    @classmethod
    def is_configured(cls) -> bool:
        """
        Check if minimum required credentials exist for live API calls.
        Note: LOGIN_CUSTOMER_ID is OPTIONAL.
        """
        return bool(
            cls.DEVELOPER_TOKEN
            and cls.CLIENT_ID
            and cls.CLIENT_SECRET
            and cls.REFRESH_TOKEN
            and cls.CUSTOMER_ID
            and len(cls.CUSTOMER_ID) == 10
            and cls.CUSTOMER_ID.isdigit()
        )
