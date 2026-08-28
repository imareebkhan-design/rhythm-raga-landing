import json
import urllib.request
import urllib.parse
from typing import Dict, Optional
from google_ads.config import Config

class GoogleAdsAuth:
    """Manages OAuth2 token refresh and HTTP authorization headers for Google Ads API REST requests."""

    _cached_access_token: Optional[str] = None

    @classmethod
    def get_access_token(cls, force_refresh: bool = False) -> Optional[str]:
        """Fetch a fresh OAuth2 access token using the refresh token."""
        if cls._cached_access_token and not force_refresh:
            return cls._cached_access_token

        if not Config.CLIENT_ID or not Config.CLIENT_SECRET or not Config.REFRESH_TOKEN:
            return None

        token_url = "https://oauth2.googleapis.com/token"
        params = {
            "client_id": Config.CLIENT_ID,
            "client_secret": Config.CLIENT_SECRET,
            "refresh_token": Config.REFRESH_TOKEN,
            "grant_type": "refresh_token"
        }

        try:
            data = urllib.parse.urlencode(params).encode("utf-8")
            req = urllib.request.Request(token_url, data=data, method="POST")
            with urllib.request.urlopen(req, timeout=10) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                cls._cached_access_token = result.get("access_token")
                return cls._cached_access_token
        except Exception as e:
            print(f"⚠️ OAuth2 Token Refresh Failed: {e}")
            return None

    @classmethod
    def get_headers(cls) -> Dict[str, str]:
        """Return HTTP Headers required for Google Ads REST API calls."""
        access_token = cls.get_access_token()
        headers = {
            "Content-Type": "application/json",
            "developer-token": Config.DEVELOPER_TOKEN,
        }
        if access_token:
            headers["Authorization"] = f"Bearer {access_token}"
        if Config.LOGIN_CUSTOMER_ID:
            headers["login-customer-id"] = Config.LOGIN_CUSTOMER_ID
        return headers
