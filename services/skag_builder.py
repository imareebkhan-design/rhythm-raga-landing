import re
from typing import List, Dict, Any, Optional

class SKAGBuilder:
    """
    Engine to build Single Keyword Ad Group (SKAG) Search Campaigns with customized
    Responsive Search Ads (RSAs) and exact/phrase keyword criteria.
    """

    DEFAULT_NEGATIVE_KEYWORDS = [
        "online free", "pdf download", "chords", "tabs", "second hand",
        "olx", "quikr", "job", "vacancy", "salary", "meaning", "wikipedia"
    ]

    @classmethod
    def build_skag_campaign(
        cls,
        campaign_name: str,
        seed_topic: str,
        keywords_data: List[Dict[str, Any]],
        daily_budget_inr: float = 500.0,
        final_url: str = "https://www.rhytthmraga.com",
        max_skags: int = 10
    ) -> Dict[str, Any]:
        """
        Builds a complete SKAG campaign structure.
        """
        # Select top targeted keywords up to max_skags
        selected_keywords = keywords_data[:max_skags]
        
        ad_groups = []
        for item in selected_keywords:
            kw_text = item["keyword"].strip()
            ad_group_structure = cls._build_single_skag_ad_group(
                keyword_text=kw_text,
                seed_topic=seed_topic,
                final_url=final_url,
                est_cpc=item.get("high_top_of_page_bid_cpc", 45.0)
            )
            ad_groups.append(ad_group_structure)

        budget_micros = int(daily_budget_inr * 1_000_000)

        campaign_blueprint = {
            "campaign_name": campaign_name,
            "seed_topic": seed_topic,
            "daily_budget_inr": daily_budget_inr,
            "daily_budget_micros": budget_micros,
            "advertising_channel_type": "SEARCH",
            "bidding_strategy_type": "MANUAL_CPC",
            "geo_target_id": "1007788", # Delhi
            "language_id": "1000",       # English
            "final_url": final_url,
            "ad_groups_count": len(ad_groups),
            "ad_groups": ad_groups,
            "campaign_negative_keywords": cls.DEFAULT_NEGATIVE_KEYWORDS
        }

        return campaign_blueprint

    @classmethod
    def _build_single_skag_ad_group(
        cls,
        keyword_text: str,
        seed_topic: str,
        final_url: str,
        est_cpc: float
    ) -> Dict[str, Any]:
        """Generates 1 Ad Group containing Exact + Phrase keywords & 1 tailored Responsive Search Ad."""
        clean_kw = keyword_text.title()
        ad_group_name = f"SKAG - {clean_kw}"

        # Exact and Phrase criteria
        criteria = [
            {"keyword": keyword_text.lower(), "match_type": "EXACT"},
            {"keyword": keyword_text.lower(), "match_type": "PHRASE"}
        ]

        # Generate RSA headlines and descriptions matching exact search query
        rsa = cls._generate_responsive_search_ad(
            keyword_text=clean_kw,
            seed_topic=seed_topic,
            final_url=final_url
        )

        return {
            "ad_group_name": ad_group_name,
            "target_keyword": keyword_text,
            "cpc_bid_inr": round(est_cpc * 1.1, 2), # Default bid 10% above high est CPC
            "criteria": criteria,
            "responsive_search_ad": rsa
        }

    @classmethod
    def _generate_responsive_search_ad(
        cls,
        keyword_text: str,
        seed_topic: str,
        final_url: str
    ) -> Dict[str, Any]:
        """Creates Responsive Search Ad assets complying with character limits."""
        # Clean topic for paths
        topic_slug = re.sub(r'[^a-zA-Z0-9]', '', seed_topic.title())[:15]
        
        # Pinned Headline 1 matching exact keyword (truncated to <= 30 chars)
        h1 = cls._truncate_text(keyword_text, max_len=30)
        
        headlines = [
            {"text": h1, "pinned_field": "HEADLINE_1"},
            {"text": cls._truncate_text("Book Free Trial Class Today", 30)},
            {"text": cls._truncate_text("GTB Nagar Gate 4 Metro", 30)},
            {"text": cls._truncate_text("1-on-1 Certified Mentors", 30)},
            {"text": cls._truncate_text(f"Top {seed_topic.title()} Academy", 30)},
            {"text": cls._truncate_text("Flexible Morning & Evening", 30)},
            {"text": cls._truncate_text("100% Beginner Friendly", 30)},
            {"text": cls._truncate_text("Call or WhatsApp Us Now", 30)},
        ]

        descriptions = [
            {"text": cls._truncate_text(f"Learn {seed_topic} from expert faculty at GTB Nagar Gate 4. Book free trial class today!", 90)},
            {"text": cls._truncate_text("Structured music & fitness classes in North Delhi. Personal mentorship & flexible timings.", 90)},
            {"text": cls._truncate_text("Join top-rated academy near DU North Campus. Call or WhatsApp for free demo class!", 90)},
            {"text": cls._truncate_text("Beginner to advanced courses with certification. Reserve your spot now at Rhythm Raga.", 90)},
        ]

        return {
            "final_urls": [final_url],
            "path1": topic_slug,
            "path2": "GTB-Nagar",
            "headlines": headlines,
            "descriptions": descriptions
        }

    @staticmethod
    def _truncate_text(text: str, max_len: int) -> str:
        """Truncates string to max_len without breaking word bounds if possible."""
        text = text.strip()
        if len(text) <= max_len:
            return text
        words = text.split()
        res = ""
        for word in words:
            if len(res + " " + word) <= max_len:
                res = (res + " " + word).strip()
            else:
                break
        return res if res else text[:max_len]
