import unittest
from google_ads.keyword_scoring.scorer import KeywordScorer
from google_ads.models.campaign import IntentCategory, KeywordMetrics

class TestKeywordScorer(unittest.TestCase):
    def test_intent_classification(self):
        self.assertEqual(KeywordScorer.classify_intent("guitar classes gtb nagar", "GTB Nagar, Delhi"), IntentCategory.HIGH_COMMERCIAL_LOCAL)
        self.assertEqual(KeywordScorer.classify_intent("best guitar academy reviews"), IntentCategory.COMMERCIAL_INVESTIGATION)
        self.assertEqual(KeywordScorer.classify_intent("how to learn guitar"), IntentCategory.INFORMATIONAL)
        self.assertEqual(KeywordScorer.classify_intent("free guitar pdf download"), IntentCategory.IRRELEVANT)
        self.assertEqual(KeywordScorer.classify_intent("guitar teacher salary"), IntentCategory.IRRELEVANT)

    def test_scoring_model(self):
        metrics = KeywordMetrics(
            avg_monthly_searches=720,
            competition="HIGH",
            competition_index=85,
            low_top_of_page_bid_cpc=25.0,
            high_top_of_page_bid_cpc=75.0
        )

        score = KeywordScorer.evaluate(
            keyword="guitar classes gtb nagar",
            metrics=metrics,
            target_service="Guitar Classes",
            target_location="GTB Nagar, Delhi"
        )

        self.assertEqual(score.intent_category, IntentCategory.HIGH_COMMERCIAL_LOCAL)
        self.assertGreaterEqual(score.overall_score, 80.0)
        self.assertIn("Intent: HIGH_COMMERCIAL_LOCAL", score.rationale)

if __name__ == "__main__":
    unittest.main()
