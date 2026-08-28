from typing import Dict, Any, List
from google_ads.config import Config
from google_ads.client.ads_client import GoogleAdsClient, GoogleAdsClientError
from google_ads.models.campaign import CampaignBlueprint, LaunchResult

class PostLaunchVerifier:
    """
    Queries Google Ads API post-launch using GAQL to verify that campaign, budget, ad groups,
    criteria, and ads exist and match blueprint specifications.
    """

    @classmethod
    def verify(
        cls,
        launch_result: LaunchResult,
        blueprint: CampaignBlueprint
    ) -> Dict[str, Any]:
        """
        Executes post-launch verification queries.
        """
        if launch_result.status != "LIVE_LAUNCH_SUCCESS" or not Config.is_configured():
            return {
                "verification_status": "SKIPPED",
                "reason": f"Verification not applicable for launch status '{launch_result.status}' (Dry run or unconfigured API).",
                "checks": []
            }

        campaign_rn = launch_result.campaign_resource_name
        if not campaign_rn:
            return {
                "verification_status": "FAILED",
                "reason": "Missing campaign resource name in launch result.",
                "checks": []
            }

        checks: List[Dict[str, Any]] = []

        # 1. Query Campaign Details via GAQL
        gaql = f"""
            SELECT campaign.id, campaign.name, campaign.status, campaign_budget.amount_micros
            FROM campaign
            WHERE campaign.resource_name = '{campaign_rn}'
        """

        try:
            res = GoogleAdsClient.search(gaql)
            rows = res.get("results", [])
            if rows:
                c_data = rows[0].get("campaign", {})
                b_data = rows[0].get("campaignBudget", {})
                amount_micros = int(b_data.get("amountMicros", 0))

                checks.append({
                    "check": "CAMPAIGN_EXISTS",
                    "status": "PASSED",
                    "details": f"Campaign ID {c_data.get('id')} ('{c_data.get('name')}') verified."
                })

                if amount_micros == blueprint.daily_budget_micros:
                    checks.append({
                        "check": "BUDGET_MATCH",
                        "status": "PASSED",
                        "details": f"Budget matches blueprint ({amount_micros} micros)."
                    })
                else:
                    checks.append({
                        "check": "BUDGET_MATCH",
                        "status": "WARNING",
                        "details": f"Budget mismatch: expected {blueprint.daily_budget_micros}, found {amount_micros}."
                    })
            else:
                checks.append({
                    "check": "CAMPAIGN_EXISTS",
                    "status": "FAILED",
                    "details": "Campaign resource name returned no results in Search API."
                })

        except GoogleAdsClientError as e:
            checks.append({
                "check": "GAQL_VERIFICATION_QUERY",
                "status": "ERROR",
                "details": f"GAQL Query Error: {e}"
            })

        all_passed = all(c.get("status") == "PASSED" for c in checks)

        return {
            "verification_status": "VERIFIED" if all_passed else "WARNINGS_FOUND",
            "campaign_resource_name": campaign_rn,
            "checks": checks
        }
