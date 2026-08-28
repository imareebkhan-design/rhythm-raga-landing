import re
from typing import List, Dict, Any
from google_ads.models.campaign import (
    CampaignRequest,
    CampaignBlueprint,
    AdGroupBlueprint,
    KeywordCluster,
    NegativeKeyword,
    KeywordIdea
)
from google_ads.ad_generator.rsa_builder import RSABuilder
from google_ads.ad_generator.asset_builder import AssetBuilder
from google_ads.geo.geo_resolver import GeoResolver
from google_ads.language.language_resolver import LanguageResolver
from google_ads.clustering.skag_clusterer import SKAGClusterer

class CampaignBlueprintBuilder:
    """
    Assembles a deterministic, structured CampaignBlueprint object.
    """

    @classmethod
    def build(
        cls,
        request: CampaignRequest,
        clusters: List[KeywordCluster],
        campaign_negatives: List[NegativeKeyword],
        ad_group_negatives: Dict[str, List[NegativeKeyword]],
        qualified_ideas_map: Dict[str, KeywordIdea]
    ) -> CampaignBlueprint:
        """
        Constructs the complete CampaignBlueprint instance.
        """
        # Resolve Geo & Language
        geo_id, canonical_location = GeoResolver.resolve_location(request.location)
        lang_id, canonical_lang = LanguageResolver.resolve_language(request.language)

        # Budget micros
        budget_micros = int(request.budget * 1_000_000)

        # Generate Ad Group Blueprints
        ad_group_blueprints: List[AdGroupBlueprint] = []

        for cluster in clusters:
            primary = cluster.primary_keyword
            idea_data = qualified_ideas_map.get(primary)
            est_cpc = idea_data.metrics.high_top_of_page_bid_cpc if idea_data else 45.0
            bid_cpc = round(est_cpc * 1.1, 2)

            # Generate RSA for ad group
            rsa = RSABuilder.generate_rsa(
                primary_keyword=primary,
                business=request.business,
                service=request.service,
                location=request.location,
                landing_page_url=cluster.landing_page_url,
                headline_pinning_mode=request.headline_pinning_mode
            )

            match_types = SKAGClusterer.get_match_types(enable_broad=request.enable_broad_match)

            ag_bp = AdGroupBlueprint(
                ad_group_name=cluster.theme_name,
                primary_keyword=primary,
                variant_keywords=cluster.variant_keywords,
                cpc_bid_inr=bid_cpc,
                match_types=match_types,
                responsive_search_ad=rsa,
                negative_keywords=ad_group_negatives.get(cluster.theme_name, []),
                rationale=f"Intent: {cluster.intent.value}, Variants: {len(cluster.variant_keywords)}"
            )
            ad_group_blueprints.append(ag_bp)

        # Campaign Name
        topic_slug = re.sub(r'[^a-zA-Z0-9]', '_', request.service.upper())
        loc_slug = re.sub(r'[^a-zA-Z0-9]', '_', request.location.upper())
        campaign_name = f"SEARCH_SKAG_{topic_slug}_{loc_slug}"

        # Assets (Sitelinks, Callouts, Structured Snippets, Call Assets)
        assets = AssetBuilder.generate_campaign_assets(
            business=request.business,
            location=request.location,
            base_url=request.landing_page_url
        )

        return CampaignBlueprint(
            version="1.0",
            business=request.business,
            offer=f"{request.service} in {request.location}",
            objective=request.objective,
            daily_budget_inr=request.budget,
            daily_budget_micros=budget_micros,
            currency="INR",
            location_name=canonical_location,
            geo_target_id=geo_id,
            language_name=canonical_lang,
            language_id=lang_id,
            bidding_strategy=request.bidding_strategy,
            campaign_name=campaign_name,
            campaign_type="SEARCH",
            landing_page_url=request.landing_page_url,
            ad_groups=ad_group_blueprints,
            campaign_negative_keywords=campaign_negatives,
            assets=assets,
            tracking_configuration={
                "utm_source": "google",
                "utm_medium": "cpc",
                "utm_campaign": campaign_name.lower()
            },
            validation_results={},
            approval_status="PENDING"
        )
