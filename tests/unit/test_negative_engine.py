import unittest
from google_ads.negatives.negative_engine import NegativeKeywordEngine
from google_ads.models.campaign import KeywordCluster, IntentCategory

class TestNegativeKeywordEngine(unittest.TestCase):
    def test_negative_keyword_generation(self):
        negatives = NegativeKeywordEngine.generate_campaign_negatives("Academy", "Guitar Classes")
        neg_texts = [n.text for n in negatives]

        self.assertIn("free chords", neg_texts)
        self.assertIn("salary", neg_texts)
        self.assertIn("violin", neg_texts)

    def test_cross_theme_conflict_resolution(self):
        clusters = [
            KeywordCluster(
                theme_name="SKAG - Guitar Classes GTB Nagar",
                primary_keyword="guitar classes gtb nagar",
                intent=IntentCategory.HIGH_COMMERCIAL_LOCAL
            ),
            KeywordCluster(
                theme_name="SKAG - Guitar Classes Hudson Lane",
                primary_keyword="guitar classes hudson lane",
                intent=IntentCategory.HIGH_COMMERCIAL_LOCAL
            )
        ]

        conflict_map = NegativeKeywordEngine.resolve_cross_theme_conflicts(clusters)

        ag1_negs = [n.text for n in conflict_map["SKAG - Guitar Classes GTB Nagar"]]
        ag2_negs = [n.text for n in conflict_map["SKAG - Guitar Classes Hudson Lane"]]

        self.assertIn("guitar classes hudson lane", ag1_negs)
        self.assertIn("guitar classes gtb nagar", ag2_negs)

if __name__ == "__main__":
    unittest.main()
