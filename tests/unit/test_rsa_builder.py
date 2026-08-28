import unittest
from google_ads.ad_generator.rsa_builder import RSABuilder

class TestRSABuilder(unittest.TestCase):
    def test_rsa_character_limits_and_pinning(self):
        rsa = RSABuilder.generate_rsa(
            primary_keyword="Guitar Classes GTB Nagar",
            business="Rhythm Raga",
            service="Guitar Classes",
            location="GTB Nagar, Delhi",
            landing_page_url="https://rhythmraga.in",
            headline_pinning_mode="HEADLINE_1_EXACT"
        )

        self.assertGreaterEqual(len(rsa.headlines), 3)
        self.assertGreaterEqual(len(rsa.descriptions), 2)

        # Verify headline bounds <= 30
        for h in rsa.headlines:
            self.assertLessEqual(len(h.text), 30)

        # Verify description bounds <= 90
        for d in rsa.descriptions:
            self.assertLessEqual(len(d.text), 90)

        # Verify H1 pinning tag
        self.assertEqual(rsa.headlines[0].pinned_field, "HEADLINE_1")

if __name__ == "__main__":
    unittest.main()
