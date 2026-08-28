from typing import Dict, Any, Tuple
from google_ads.config import Config
from google_ads.client.ads_client import GoogleAdsClient, GoogleAdsClientError

class IdempotencyChecker:
    """
    Checks for pre-existing campaigns to avoid accidental duplicate creation.
    """

    @classmethod
    def check_campaign_exists(cls, campaign_name: str) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Queries Google Ads API for existing campaign with matching name.
        Returns (exists: bool, decision: 'CREATE'|'SKIP'|'UPDATE', existing_data: dict).
        """
        if not Config.is_configured():
            return False, "CREATE", {}

        gaql = f"""
            SELECT campaign.id, campaign.name, campaign.status
            FROM campaign
            WHERE campaign.name = '{campaign_name}' AND campaign.status != 'REMOVED'
        """

        try:
            res = GoogleAdsClient.search(gaql)
            rows = res.get("results", [])
            if rows:
                c_data = rows[0].get("campaign", {})
                return True, "SKIP", c_data
        except GoogleAdsClientError as e:
            print(f"⚠️ Idempotency check GAQL query error ({e}). Defaulting to CREATE mode.")

        return False, "CREATE", {}
