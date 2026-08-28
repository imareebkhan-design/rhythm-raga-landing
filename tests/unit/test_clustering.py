import unittest
from google_ads.clustering.skag_clusterer import SKAGClusterer
from google_ads.models.campaign import KeywordIdea, KeywordMetrics, KeywordScore, IntentCategory

class TestSKAGClusterer(unittest.TestCase):
    def test_skag_clustering(self):
        ideas = [
            KeywordIdea(
                keyword="guitar classes near me",
                metrics=KeywordMetrics(avg_monthly_searches=500),
                score=KeywordScore(
                    intent_category=IntentCategory.HIGH_COMMERCIAL_LOCAL,
                    intent_score=100.0,
                    location_relevance=100.0,
                    commercial_relevance=100.0,
                    overall_score=95.0
                )
            ),
            KeywordIdea(
                keyword="guitar classes in gtb nagar",
                metrics=KeywordMetrics(avg_monthly_searches=300),
                score=KeywordScore(
                    intent_category=IntentCategory.HIGH_COMMERCIAL_LOCAL,
                    intent_score=100.0,
                    location_relevance=100.0,
                    commercial_relevance=100.0,
                    overall_score=90.0
                )
            )
        ]

        clusters = SKAGClusterer.create_clusters(
            qualified_ideas=ideas,
            landing_page_url="https://rhythmraga.in",
            max_skags=5
        )

        self.assertEqual(len(clusters), 2)
        self.assertEqual(clusters[0].primary_keyword, "guitar classes near me")
        self.assertEqual(clusters[1].primary_keyword, "guitar classes in gtb nagar")

if __name__ == "__main__":
    unittest.main()
