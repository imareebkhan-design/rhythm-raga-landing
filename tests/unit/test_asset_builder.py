import unittest
from google_ads.ad_generator.asset_builder import AssetBuilder
from google_ads.models.campaign import CampaignAssets
from google_ads.validators.local_validator import LocalValidator
from google_ads.campaign_builder.builder import CampaignBlueprintBuilder
from google_ads.models.campaign import CampaignRequest, KeywordCluster, IntentCategory

class TestAssetBuilder(unittest.TestCase):
    def test_campaign_assets_generation(self):
        assets = AssetBuilder.generate_campaign_assets(
            business="Rhythm Raga",
            location="GTB Nagar, Delhi",
            base_url="https://rhythmraga.in",
            phone_number="+918796574448"
        )

        self.assertIsInstance(assets, CampaignAssets)
        # Sitelinks check (min 4 recommended)
        self.assertGreaterEqual(len(assets.sitelinks), 4)

        sitelink_texts = [s.text for s in assets.sitelinks]
        self.assertIn("Learn Guitar", sitelink_texts)
        self.assertIn("Learn Piano & Keys", sitelink_texts)
        self.assertIn("Learn Drums", sitelink_texts)
        self.assertIn("Singing & Vocals", sitelink_texts)

        # Character bounds for sitelinks
        for s in assets.sitelinks:
            self.assertLessEqual(len(s.text), 25)
            self.assertLessEqual(len(s.description1), 35)
            self.assertLessEqual(len(s.description2), 35)
            self.assertTrue(s.final_url.startswith("https://rhythmraga.in"))

        # Callouts bounds
        self.assertGreaterEqual(len(assets.callouts), 4)
        for c in assets.callouts:
            self.assertLessEqual(len(c.text), 25)

        # Snippets
        self.assertGreaterEqual(len(assets.structured_snippets), 1)

        # Call asset
        self.assertIsNotNone(assets.call_asset)
        self.assertEqual(assets.call_asset.country_code, "IN")

    def test_blueprint_validation_with_assets(self):
        req = CampaignRequest(
            business="Rhythm Raga",
            service="Guitar Classes",
            location="GTB Nagar, Delhi",
            budget=500.0
        )
        clusters = [
            KeywordCluster(
                theme_name="SKAG - Guitar Classes GTB Nagar",
                primary_keyword="guitar classes gtb nagar",
                variant_keywords=["guitar lessons gtb nagar"],
                intent=IntentCategory.HIGH_COMMERCIAL_LOCAL
            )
        ]
        bp = CampaignBlueprintBuilder.build(
            request=req,
            clusters=clusters,
            campaign_negatives=[],
            ad_group_negatives={},
            qualified_ideas_map={}
        )

        val = LocalValidator.validate(bp)
        self.assertTrue(val.is_valid, f"Validation errors: {val.local_errors}")
        self.assertGreaterEqual(len(bp.assets.sitelinks), 4)

if __name__ == "__main__":
    unittest.main()
