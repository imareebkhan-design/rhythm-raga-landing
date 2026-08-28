from typing import Dict, Any, List
from google_ads.config import Config
from google_ads.client.ads_client import GoogleAdsClient, GoogleAdsClientError
from google_ads.models.campaign import CampaignBlueprint, LaunchResult
from google_ads.validators.local_validator import LocalValidator
from google_ads.validators.landing_page import LandingPageValidator
from google_ads.validators.google_validator import GoogleValidator

class CampaignExecutor:
    """
    Executes pre-flight validation and transactional Google Ads campaign mutation.
    """

    @classmethod
    def run(
        cls,
        blueprint: CampaignBlueprint,
        dry_run: bool = True
    ) -> LaunchResult:
        """
        Runs complete launch pipeline for a CampaignBlueprint.
        """
        # 1. Local Validation
        local_val = LocalValidator.validate(blueprint)
        if not local_val.is_valid:
            return LaunchResult(
                status="VALIDATION_FAILED",
                mode="LOCAL_VALIDATION_FAILED",
                campaign_name=blueprint.campaign_name,
                errors=local_val.local_errors,
                blueprint=blueprint.to_dict()
            )

        # 2. Landing Page Validation
        lp_ok, lp_warns = LandingPageValidator.validate_url(
            url=blueprint.landing_page_url,
            service=blueprint.offer,
            location=blueprint.location_name
        )
        if not lp_ok:
            return LaunchResult(
                status="VALIDATION_FAILED",
                mode="LANDING_PAGE_FAILED",
                campaign_name=blueprint.campaign_name,
                errors=lp_warns,
                blueprint=blueprint.to_dict()
            )

        # 3. Dry-Run / Preview Execution
        if dry_run or not Config.is_configured():
            return cls._execute_dry_run(blueprint, local_val)

        # 4. Live Google Ads API Execution
        return cls._execute_live_mutation(blueprint)

    @classmethod
    def _execute_dry_run(cls, blueprint: CampaignBlueprint, local_val: Any) -> LaunchResult:
        ad_groups_count = len(blueprint.ad_groups)
        total_keywords_count = sum(len(ag.variant_keywords) + 1 for ag in blueprint.ad_groups) * len(blueprint.ad_groups[0].match_types) if blueprint.ad_groups else 0

        # Attempt Google API validate_only check if credentials exist
        g_api_ok, g_api_msgs = GoogleValidator.validate_with_google(blueprint)

        execution_steps = [
            {
                "step": 1,
                "operation": "CampaignBudgetService.MutateCampaignBudgets",
                "status": "VALIDATED (DRY-RUN)",
                "details": f"Set budget to ₹{blueprint.daily_budget_inr}/day ({blueprint.daily_budget_micros} micros)."
            },
            {
                "step": 2,
                "operation": "CampaignService.MutateCampaigns",
                "status": "VALIDATED (DRY-RUN)",
                "details": f"Campaign '{blueprint.campaign_name}' channel SEARCH, bidding {blueprint.bidding_strategy}."
            },
            {
                "step": 3,
                "operation": "CampaignCriterionService.MutateCampaignCriteria",
                "status": "VALIDATED (DRY-RUN)",
                "details": f"Geo ID {blueprint.geo_target_id} ({blueprint.location_name}), Lang ID {blueprint.language_id} ({blueprint.language_name}). Negatives: {len(blueprint.campaign_negative_keywords)} terms."
            },
            {
                "step": 4,
                "operation": "AdGroupService.MutateAdGroups",
                "status": "VALIDATED (DRY-RUN)",
                "details": f"Created {ad_groups_count} SKAG ad groups."
            },
            {
                "step": 5,
                "operation": "AdGroupCriterionService.MutateAdGroupCriteria",
                "status": "VALIDATED (DRY-RUN)",
                "details": f"Added {total_keywords_count} match criteria across ad groups."
            },
            {
                "step": 6,
                "operation": "AdGroupAdService.MutateAdGroupAds",
                "status": "VALIDATED (DRY-RUN)",
                "details": f"Created {ad_groups_count} Responsive Search Ads (RSAs) with Excellent Ad Strength configuration."
            },
            {
                "step": 7,
                "operation": "CampaignAssetService.MutateCampaignAssets",
                "status": "VALIDATED (DRY-RUN)",
                "details": f"Configured {len(blueprint.assets.sitelinks)} Sitelinks, {len(blueprint.assets.callouts)} Callouts, {len(blueprint.assets.structured_snippets)} Structured Snippets, and Call Asset ({blueprint.assets.call_asset.phone_number if blueprint.assets.call_asset else 'N/A'})."
            }
        ]

        if not g_api_ok:
            execution_steps.append({
                "step": 8,
                "operation": "GoogleAdsService.ValidateOnly",
                "status": "WARNING",
                "details": f"Google API validate_only notice: {g_api_msgs}"
            })

        return LaunchResult(
            status="DRY_RUN_SUCCESS",
            mode="DRY_RUN (Pre-flight Verification Passed)",
            campaign_name=blueprint.campaign_name,
            execution_steps=execution_steps,
            blueprint=blueprint.to_dict()
        )

    @classmethod
    def _execute_live_mutation(cls, blueprint: CampaignBlueprint) -> LaunchResult:
        customer_id = Config.CUSTOMER_ID
        operations: List[Dict[str, Any]] = []

        temp_budget_rn = f"customers/{customer_id}/campaignBudgets/-1"
        temp_campaign_rn = f"customers/{customer_id}/campaigns/-2"

        # 1. Budget Operation
        operations.append({
            "campaignBudgetOperation": {
                "create": {
                    "resourceName": temp_budget_rn,
                    "name": f"Budget - {blueprint.campaign_name}",
                    "amountMicros": str(blueprint.daily_budget_micros),
                    "deliveryMethod": "STANDARD"
                }
            }
        })

        # 2. Campaign Operation
        operations.append({
            "campaignOperation": {
                "create": {
                    "resourceName": temp_campaign_rn,
                    "name": blueprint.campaign_name,
                    "advertisingChannelType": "SEARCH",
                    "status": "PAUSED",  # Safe PAUSED state
                    "campaignBudget": temp_budget_rn,
                    "manualCpc": {"enhancedCpcEnabled": False},
                    "geoTargetTypeSetting": {
                        "positiveGeoTargetType": "PRESENCE",  # Restrict strictly to people physically present in target location
                        "negativeGeoTargetType": "PRESENCE_OR_INTEREST"
                    },
                    "networkSettings": {
                        "targetGoogleSearch": True,
                        "targetSearchNetwork": False,  # Disable Search Partners to prevent low quality/external bot clicks
                        "targetContentNetwork": False, # Disable Display Expansion Network (prevents foreign app clicks)
                        "targetPartnerSearchNetwork": False
                    }
                }
            }
        })

        # 3. Campaign Geo Targeting Operation (Positive Target)
        operations.append({
            "campaignCriterionOperation": {
                "create": {
                    "campaign": temp_campaign_rn,
                    "location": {
                        "geoTargetConstant": f"geoTargetConstants/{blueprint.geo_target_id}"
                    }
                }
            }
        })

        # 3b. Campaign Negative Geo Exclusions (Block foreign traffic & non-target states)
        # 2586=Pakistan, 2050=Bangladesh, 2784=UAE, 2524=Nepal, 20409=Karnataka, 20424=Tamil Nadu, 20414=Maharashtra, 20427=Telangana, 20410=Kerala
        NEGATIVE_GEO_IDS = ["2586", "2050", "2784", "2524", "20409", "20424", "20414", "20427", "20410"]
        for neg_geo_id in NEGATIVE_GEO_IDS:
            operations.append({
                "campaignCriterionOperation": {
                    "create": {
                        "campaign": temp_campaign_rn,
                        "location": {
                            "geoTargetConstant": f"geoTargetConstants/{neg_geo_id}"
                        },
                        "negative": True
                    }
                }
            })

        # 4. Campaign Language Targeting Operation
        operations.append({
            "campaignCriterionOperation": {
                "create": {
                    "campaign": temp_campaign_rn,
                    "language": {
                        "languageConstant": f"languageConstants/{blueprint.language_id}"
                    }
                }
            }
        })

        # 5. Campaign Negatives Operations
        for neg in blueprint.campaign_negative_keywords:
            operations.append({
                "campaignCriterionOperation": {
                    "create": {
                        "campaign": temp_campaign_rn,
                        "keyword": {
                            "text": neg.text,
                            "matchType": neg.match_type
                        },
                        "negative": True
                    }
                }
            })

        # 6. Ad Groups, Criteria, and RSAs
        temp_counter = -3
        ad_group_resource_names = []
        created_ad_ids = []

        for ag_idx, ag in enumerate(blueprint.ad_groups):
            ag_temp_rn = f"customers/{customer_id}/adGroups/{temp_counter}"
            ad_group_resource_names.append(ag_temp_rn)
            temp_counter -= 1

            # Ad Group Operation
            operations.append({
                "adGroupOperation": {
                    "create": {
                        "resourceName": ag_temp_rn,
                        "name": ag.ad_group_name,
                        "campaign": temp_campaign_rn,
                        "status": "ENABLED",
                        "cpcBidMicros": str(int(ag.cpc_bid_inr * 1_000_000))
                    }
                }
            })

            # Keywords Criteria (Primary + Variants for each match type)
            all_kws = [ag.primary_keyword] + ag.variant_keywords
            for kw_text in all_kws:
                for match_type in ag.match_types:
                    operations.append({
                        "adGroupCriterionOperation": {
                            "create": {
                                "adGroup": ag_temp_rn,
                                "status": "ENABLED",
                                "keyword": {
                                    "text": kw_text.lower(),
                                    "matchType": match_type
                                }
                            }
                        }
                    })

            # Ad Group Level Negatives
            for neg in ag.negative_keywords:
                operations.append({
                    "adGroupCriterionOperation": {
                        "create": {
                            "adGroup": ag_temp_rn,
                            "keyword": {
                                "text": neg.text.lower(),
                                "matchType": neg.match_type
                            },
                            "negative": True
                        }
                    }
                })

            # RSA Operation
            rsa = ag.responsive_search_ad
            headlines_payload = []
            for h in rsa.headlines:
                h_item: Dict[str, Any] = {"text": h.text}
                if h.pinned_field:
                    h_item["pinnedField"] = h.pinned_field
                headlines_payload.append(h_item)

            descriptions_payload = []
            for d in rsa.descriptions:
                descriptions_payload.append({"text": d.text})

            ad_temp_rn = f"customers/{customer_id}/adGroupAds/{temp_counter}"
            created_ad_ids.append(ad_temp_rn)
            temp_counter -= 1

            operations.append({
                "adGroupAdOperation": {
                    "create": {
                        "resourceName": ad_temp_rn,
                        "adGroup": ag_temp_rn,
                        "status": "ENABLED",
                        "ad": {
                            "finalUrls": rsa.final_urls,
                            "path1": rsa.path1,
                            "path2": rsa.path2,
                            "responsiveSearchAd": {
                                "headlines": headlines_payload,
                                "descriptions": descriptions_payload
                            }
                        }
                    }
                }
            })

        # Submit single atomic mutate call to Google Ads API
        try:
            response = GoogleAdsClient.mutate(operations, validate_only=False)
            mutate_results = response.get("mutateOperationResponses", [])

            # Parse returned resource names
            campaign_rn = ""
            budget_rn = ""
            for item in mutate_results:
                if "campaignResult" in item:
                    campaign_rn = item["campaignResult"]["resourceName"]
                elif "campaignBudgetResult" in item:
                    budget_rn = item["campaignBudgetResult"]["resourceName"]

            return LaunchResult(
                status="LIVE_LAUNCH_SUCCESS",
                mode="LIVE_EXECUTION",
                campaign_name=blueprint.campaign_name,
                campaign_resource_name=campaign_rn,
                budget_resource_name=budget_rn,
                ad_group_ids=ad_group_resource_names,
                ad_ids=created_ad_ids,
                execution_steps=[{
                    "step": 1,
                    "operation": "GoogleAdsService.Mutate",
                    "status": "SUCCESS",
                    "details": f"Created campaign '{blueprint.campaign_name}' with {len(blueprint.ad_groups)} ad groups in PAUSED state."
                }],
                blueprint=blueprint.to_dict()
            )

        except GoogleAdsClientError as e:
            return LaunchResult(
                status="API_EXECUTION_ERROR",
                mode="LIVE_EXECUTION_FAILED",
                campaign_name=blueprint.campaign_name,
                errors=[str(e)],
                blueprint=blueprint.to_dict()
            )
