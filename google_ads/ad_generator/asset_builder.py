import re
from typing import List, Optional
from google_ads.models.campaign import (
    SitelinkAsset,
    CalloutAsset,
    StructuredSnippetAsset,
    CallAsset,
    CampaignAssets
)

class AssetBuilder:
    """
    Generates high-CTR, policy-compliant Campaign Asset Extensions (Sitelinks, Callouts,
    Structured Snippets, Call Assets) optimized for local music & dance academies.
    """

    MAX_SITELINK_TEXT = 25
    MAX_SITELINK_DESC = 35
    MAX_CALLOUT_TEXT = 25
    MAX_SNIPPET_VALUE = 25

    @classmethod
    def generate_campaign_assets(
        cls,
        business: str = "Rhythm Raga",
        location: str = "GTB Nagar, Delhi",
        base_url: str = "https://rhythmraga.in",
        phone_number: str = "+918796574448"
    ) -> CampaignAssets:
        """
        Builds full suite of high-performing campaign extensions for Rhytthm Raga.
        """
        loc_short = location.split(',')[0].strip()

        # 1. Sitelinks (Full catalog of high-intent instrument & academy links)
        raw_sitelinks = [
            SitelinkAsset(
                text="Learn Guitar",
                description1="Acoustic & Electric Guitar",
                description2=f"Offline Classes in {loc_short}",
                final_url=f"{base_url}/book?course=Guitar"
            ),
            SitelinkAsset(
                text="Learn Piano & Keys",
                description1="Western & Classical Keyboard",
                description2="Beginner to Advanced Batches",
                final_url=f"{base_url}/book?course=Piano"
            ),
            SitelinkAsset(
                text="Learn Drums",
                description1="Acoustic Drum Kits & Rhythm",
                description2="Hands-On Practice in Studio",
                final_url=f"{base_url}/book?course=Drums"
            ),
            SitelinkAsset(
                text="Singing & Vocals",
                description1="Classical & Western Singing",
                description2="Pitch & Voice Training",
                final_url=f"{base_url}/book?course=Vocals"
            ),
            SitelinkAsset(
                text="1-on-1 Music Mentors",
                description1="Certified Expert Instructors",
                description2="Personalized Step-by-Step Plans",
                final_url=f"{base_url}/book"
            ),
            SitelinkAsset(
                text="Creative Art & Craft",
                description1="Sketching, Painting & Colors",
                description2="Kids & Teens Art Studio",
                final_url=f"{base_url}/book?course=Creative%20Art"
            ),
            SitelinkAsset(
                text="Book Free Trial Class",
                description1="30-Min In-Person Studio Demo",
                description2="Zero Obligation Free Session",
                final_url=f"{base_url}/book"
            ),
            SitelinkAsset(
                text="Batch Timings & Fees",
                description1="Flexible Morning & Evening",
                description2="Small Batches (Max 4-5)",
                final_url=f"{base_url}/#courses"
            ),
            SitelinkAsset(
                text="Visit GTB Nagar Studio",
                description1="Near Metro Gate 4 Hudson Lane",
                description2="Soundproof AC Practice Rooms",
                final_url=f"{base_url}/#location"
            ),
            SitelinkAsset(
                text="Kids Music Batches",
                description1="Ages 4 to 14 Years Early Start",
                description2="Fun Interactive Curriculum",
                final_url=f"{base_url}/book?course=Not%20sure%20yet"
            )
        ]

        valid_sitelinks: List[SitelinkAsset] = []
        for s in raw_sitelinks:
            text_clean = cls.truncate_text(s.text, cls.MAX_SITELINK_TEXT)
            d1_clean = cls.truncate_text(s.description1, cls.MAX_SITELINK_DESC)
            d2_clean = cls.truncate_text(s.description2, cls.MAX_SITELINK_DESC)
            valid_sitelinks.append(SitelinkAsset(
                text=text_clean,
                description1=d1_clean,
                description2=d2_clean,
                final_url=s.final_url
            ))

        # 2. Callouts (Key USPs & Trust Anchors)
        raw_callouts = [
            f"Near {loc_short} Metro Gate 4",
            "In-Studio Offline Classes",
            "1-on-1 Certified Mentors",
            "Small Batches (Max 4-5)",
            "Kids & Adults Batches",
            "Flexible Batches",
            "Real Acoustic Instruments"
        ]

        valid_callouts: List[CalloutAsset] = []
        for c in raw_callouts:
            clean = cls.truncate_text(c, cls.MAX_CALLOUT_TEXT)
            if clean:
                valid_callouts.append(CalloutAsset(text=clean))

        # 3. Structured Snippets
        valid_snippets = [
            StructuredSnippetAsset(
                header="Courses",
                values=["Guitar", "Piano", "Drums", "Vocals", "Keyboard", "Art"]
            ),
            StructuredSnippetAsset(
                header="Amenities",
                values=["Soundproof Rooms", "Acoustic Kits", "AC Studio", "Trial Class"]
            )
        ]

        # 4. Call Asset
        call_asset = CallAsset(
            phone_number=phone_number,
            country_code="IN"
        )

        return CampaignAssets(
            sitelinks=valid_sitelinks,
            callouts=valid_callouts,
            structured_snippets=valid_snippets,
            call_asset=call_asset
        )

    @staticmethod
    def truncate_text(text: str, max_len: int) -> str:
        text = text.strip()
        if len(text) <= max_len:
            return text
        words = text.split()
        res = ""
        for word in words:
            if len((res + " " + word).strip()) <= max_len:
                res = (res + " " + word).strip()
            else:
                break
        return res if res else text[:max_len]
