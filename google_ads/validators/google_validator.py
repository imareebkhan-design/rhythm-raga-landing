from typing import Dict, Any, Tuple, List
from google_ads.config import Config
from google_ads.client.ads_client import GoogleAdsClient, GoogleAdsClientError
from google_ads.models.campaign import CampaignBlueprint

class GoogleValidator:
    """
    Submits campaign mutation payloads to Google Ads API using validate_only=True for server-side verification.
    """

    @classmethod
    def validate_with_google(cls, blueprint: CampaignBlueprint) -> Tuple[bool, List[str]]:
        """
        Sends validateOnly request payload to Google Ads API.
        """
        if not Config.is_configured():
            return True, ["Skipped Google API validation: API credentials not configured."]

        customer_id = Config.CUSTOMER_ID

        # Construct mutate operations with temporary resource names
        temp_budget_rn = f"customers/{customer_id}/campaignBudgets/-1"
        temp_campaign_rn = f"customers/{customer_id}/campaigns/-2"

        operations = [
            {
                "campaignBudgetOperation": {
                    "create": {
                        "resourceName": temp_budget_rn,
                        "name": f"Budget - {blueprint.campaign_name}",
                        "amountMicros": str(blueprint.daily_budget_micros),
                        "deliveryMethod": "STANDARD"
                    }
                }
            },
            {
                "campaignOperation": {
                    "create": {
                        "resourceName": temp_campaign_rn,
                        "name": blueprint.campaign_name,
                        "advertisingChannelType": "SEARCH",
                        "status": "PAUSED",
                        "campaignBudget": temp_budget_rn,
                        "manualCpc": {"enhancedCpcEnabled": False}
                    }
                }
            }
        ]

        try:
            res = GoogleAdsClient.mutate(operations, validate_only=True)
            return True, ["Google Ads API server-side payload validation PASSED (validate_only=true)."]
        except GoogleAdsClientError as e:
            return False, [f"Google Ads API Validation Failed: {e}"]
        except Exception as e:
            return False, [f"Google Ads API Validation Error: {str(e)}"]
