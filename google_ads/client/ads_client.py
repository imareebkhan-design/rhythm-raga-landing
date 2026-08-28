import json
import urllib.request
import urllib.parse
from typing import Dict, Any, List, Optional
from google_ads.config import Config
from google_ads.auth.oauth import GoogleAdsAuth

class GoogleAdsClientError(Exception):
    """Custom exception for Google Ads API HTTP / RPC errors."""
    def __init__(self, message: str, status_code: Optional[int] = None, error_details: Optional[Dict[str, Any]] = None):
        super().__init__(message)
        self.status_code = status_code
        self.error_details = error_details or {}

class GoogleAdsClient:
    """HTTP REST Client wrapper for Google Ads API endpoints."""

    @classmethod
    def post(cls, endpoint: str, payload: Dict[str, Any], validate_only: bool = False) -> Dict[str, Any]:
        """
        Sends an HTTP POST request to a relative or full Google Ads API endpoint.
        If validate_only is True, appends validateOnly query param.
        """
        if endpoint.startswith("http://") or endpoint.startswith("https://"):
            url = endpoint
        else:
            url = f"{Config.BASE_URL}/{endpoint.lstrip('/')}"

        if validate_only:
            sep = "&" if "?" in url else "?"
            url = f"{url}{sep}validateOnly=true"

        headers = GoogleAdsAuth.get_headers()
        req_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=req_data, headers=headers, method="POST")

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                body = resp.read().decode("utf-8")
                return json.loads(body) if body else {}
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            err_json = {}
            try:
                err_json = json.loads(err_body)
            except Exception:
                err_json = {"raw_error": err_body}
            
            message = err_json.get("error", {}).get("message", str(e))
            raise GoogleAdsClientError(
                message=f"Google Ads API Error ({e.code}): {message}",
                status_code=e.code,
                error_details=err_json
            ) from e
        except Exception as e:
            raise GoogleAdsClientError(message=f"Network/Connection Error: {str(e)}") from e

    @classmethod
    def generate_keyword_ideas(cls, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Calls customer:generateKeywordIdeas endpoint."""
        customer_id = Config.CUSTOMER_ID
        endpoint = f"customers/{customer_id}:generateKeywordIdeas"
        return cls.post(endpoint, payload)

    @classmethod
    def mutate(cls, mutate_operations: List[Dict[str, Any]], validate_only: bool = False) -> Dict[str, Any]:
        """
        Executes atomic batch operations via GoogleAdsService.Mutate.
        """
        customer_id = Config.CUSTOMER_ID
        endpoint = f"customers/{customer_id}/googleAds:mutate"
        payload = {
            "mutateOperations": mutate_operations
        }
        return cls.post(endpoint, payload, validate_only=validate_only)

    @classmethod
    def search(cls, query: str) -> Dict[str, Any]:
        """Executes a GAQL query via googleAds:search endpoint."""
        customer_id = Config.CUSTOMER_ID
        endpoint = f"customers/{customer_id}/googleAds:search"
        payload = {
            "query": query
        }
        return cls.post(endpoint, payload)

    @classmethod
    def get(cls, endpoint: str) -> Dict[str, Any]:
        """
        Sends an HTTP GET request to a relative or full Google Ads API endpoint.
        """
        if endpoint.startswith("http://") or endpoint.startswith("https://"):
            url = endpoint
        else:
            url = f"{Config.BASE_URL}/{endpoint.lstrip('/')}"

        headers = GoogleAdsAuth.get_headers()
        req = urllib.request.Request(url, headers=headers, method="GET")

        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                body = resp.read().decode("utf-8")
                return json.loads(body) if body else {}
        except urllib.error.HTTPError as e:
            err_body = e.read().decode("utf-8")
            err_json = {}
            try:
                err_json = json.loads(err_body)
            except Exception:
                err_json = {"raw_error": err_body}

            message = err_json.get("error", {}).get("message", str(e))
            raise GoogleAdsClientError(
                message=f"Google Ads API Error ({e.code}): {message}",
                status_code=e.code,
                error_details=err_json
            ) from e
        except Exception as e:
            raise GoogleAdsClientError(message=f"Network/Connection Error: {str(e)}") from e

    @classmethod
    def list_accessible_customers(cls) -> List[str]:
        """
        Calls customers:listAccessibleCustomers endpoint to list accessible customer resource names.
        """
        url = f"{Config.BASE_URL}/customers:listAccessibleCustomers"
        resp = cls.get(url)
        return resp.get("resourceNames", [])

    @classmethod
    def suggest_geo_targets(cls, location_names: List[str], locale: str = "en") -> Dict[str, Any]:
        """Suggests geo target constants by location query."""
        endpoint = "geoTargetConstants:suggest"
        payload = {
            "locale": locale,
            "locationNames": {
                "names": location_names
            }
        }
        return cls.post(endpoint, payload)
