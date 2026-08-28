import unittest
from google_ads.models.campaign import CampaignRequest
from google_ads.keyword_research.planner import KeywordPlannerService
from google_ads.clustering.skag_clusterer import SKAGClusterer
from google_ads.negatives.negative_engine import NegativeKeywordEngine
from google_ads.campaign_builder.builder import CampaignBlueprintBuilder
from google_ads.launcher.executor import CampaignExecutor

class TestLauncherIntegration(unittest.TestCase):
    def test_full_launcher_dry_run(self):
        req = CampaignRequest(
            business="Music Academy",
            service="Guitar Classes",
            location="GTB Nagar, Delhi",
            budget=500.0,
            objective="lead_generation",
            landing_page_url="https://rhythmraga.in"
        )

        ideas = KeywordPlannerService.fetch_keyword_ideas(
            seed_keywords=[req.service],
            page_url=req.landing_page_url,
            target_service=req.service,
            target_location=req.location,
            use_api_if_available=False
        )

        ideas_map = {i.keyword.lower(): i for i in ideas}

        clusters = SKAGClusterer.create_clusters(
            qualified_ideas=ideas,
            landing_page_url=req.landing_page_url,
            max_skags=3
        )

        campaign_negs = NegativeKeywordEngine.generate_campaign_negatives(req.business, req.service)
        ad_group_negs = NegativeKeywordEngine.resolve_cross_theme_conflicts(clusters)

        blueprint = CampaignBlueprintBuilder.build(
            request=req,
            clusters=clusters,
            campaign_negatives=campaign_negs,
            ad_group_negatives=ad_group_negs,
            qualified_ideas_map=ideas_map
        )

        res = CampaignExecutor.run(blueprint, dry_run=True)

        self.assertEqual(res.status, "DRY_RUN_SUCCESS")
        self.assertEqual(res.campaign_name, blueprint.campaign_name)
        self.assertGreaterEqual(len(res.execution_steps), 5)

if __name__ == "__main__":
    unittest.main()
