import re
from typing import List, Dict, Any, Optional
from google_ads.config import Config
from google_ads.models.campaign import ResponsiveSearchAd, AdAsset

class RSABuilder:
    """
    Generates policy-compliant Responsive Search Ads (RSAs) for Google Ads ad groups.
    Enforces strict Google Ads asset length bounds and character rules.
    """

    MAX_HEADLINE_LENGTH = 30
    MAX_DESCRIPTION_LENGTH = 90
    MAX_PATH_LENGTH = 15

    @classmethod
    def generate_rsa(
        cls,
        primary_keyword: str,
        business: str,
        service: str,
        location: str,
        landing_page_url: str,
        headline_pinning_mode: Optional[str] = None
    ) -> ResponsiveSearchAd:
        """
        Builds a ResponsiveSearchAd with headlines and descriptions.
        """
        pinning_mode = headline_pinning_mode or Config.HEADLINE_PINNING_MODE

        # 1. Clean service name to avoid duplicate suffixes like 'Guitar Classes Classes'
        loc_short = location.split(',')[0].strip()
        svc_clean_title = re.sub(r'(?i)\s*(classes|lessons|academy|course)', '', service).strip().title()
        if not svc_clean_title:
            svc_clean_title = service.title()

        # Keyword-specific headline (or Dynamic Keyword Insertion fallback)
        kw_headline = cls.truncate_text(primary_keyword.title(), cls.MAX_HEADLINE_LENGTH)

        raw_headlines = [
            # Category A: Exact Keyword & High-Intent Physical Location (Pinned / Priority)
            AdAsset(text=kw_headline),
            AdAsset(text=cls.truncate_text(f"Offline {svc_clean_title} Classes", cls.MAX_HEADLINE_LENGTH)),
            AdAsset(text=cls.truncate_text(f"{svc_clean_title} Classes in {loc_short}", cls.MAX_HEADLINE_LENGTH)),
            AdAsset(text=cls.truncate_text(f"Near {loc_short} Metro Gate 4", cls.MAX_HEADLINE_LENGTH)),
            AdAsset(text=cls.truncate_text(f"{loc_short} Music Studio", cls.MAX_HEADLINE_LENGTH)),
            AdAsset(text=cls.truncate_text(f"Learn {svc_clean_title} From Scratch", cls.MAX_HEADLINE_LENGTH)),
            
            # Category B: High-Intent Studio Trial & Booking CTAs
            AdAsset(text="Book In-Person Studio Trial"),
            AdAsset(text="Visit Our GTB Nagar Studio"),
            AdAsset(text="Reserve Your Studio Demo Now"),
            AdAsset(text="Call or WhatsApp Us Today"),

            # Category C: Mentorship, Curriculum & Academic Seriousness
            AdAsset(text="1-on-1 Certified Mentors"),
            AdAsset(text="Structured Course Curriculum"),
            AdAsset(text="Small Batches (Max 4-5)"),
            AdAsset(text="Classes for Kids & Adults"),
            AdAsset(text="Beginner to Advanced Batches"),
            AdAsset(text="Flexible Evening Batches"),
        ]

        # Deduplicate and validate headlines
        valid_headlines: List[AdAsset] = []
        seen_h = set()
        for idx, h in enumerate(raw_headlines):
            clean = h.text.strip()
            if clean and clean.lower() not in seen_h and len(clean) <= cls.MAX_HEADLINE_LENGTH:
                seen_h.add(clean.lower())
                pinned = "HEADLINE_1" if (idx == 0 and pinning_mode == "HEADLINE_1_EXACT") else None
                valid_headlines.append(AdAsset(text=clean, pinned_field=pinned))

        # 2. Descriptions (4 complete descriptions ≤90 chars, full sentences with offline studio qualifiers)
        svc_lower = svc_clean_title.lower()
        raw_descriptions = [
            AdAsset(text=cls.truncate_text(f"Offline {svc_lower} classes at GTB Nagar (near Metro Gate 4). 1-on-1 certified mentors.", cls.MAX_DESCRIPTION_LENGTH)),
            AdAsset(text=cls.truncate_text(f"Structured in-studio {svc_lower} lessons near Hudson Lane. Flexible morning & evening batches.", cls.MAX_DESCRIPTION_LENGTH)),
            AdAsset(text=cls.truncate_text(f"Premier physical music academy in North Delhi. Book your in-person studio trial today!", cls.MAX_DESCRIPTION_LENGTH)),
            AdAsset(text=cls.truncate_text(f"Small offline batches for kids & adults in GTB Nagar. Call or WhatsApp to book demo.", cls.MAX_DESCRIPTION_LENGTH)),
        ]

        valid_descriptions: List[AdAsset] = []
        seen_d = set()
        for d in raw_descriptions:
            clean = d.text.strip()
            if clean and clean.lower() not in seen_d and len(clean) <= cls.MAX_DESCRIPTION_LENGTH:
                seen_d.add(clean.lower())
                valid_descriptions.append(AdAsset(text=clean, pinned_field=None))

        # 3. Path Slugs
        path1 = re.sub(r'[^a-zA-Z0-9]', '', f"{svc_clean_title}Classes")[:cls.MAX_PATH_LENGTH]
        loc_part = location.split(',')[0].strip()
        path2 = re.sub(r'[^a-zA-Z0-9]', '', loc_part.title())[:cls.MAX_PATH_LENGTH]

        return ResponsiveSearchAd(
            final_urls=[landing_page_url],
            path1=path1,
            path2=path2,
            headlines=valid_headlines[:15],
            descriptions=valid_descriptions[:4]
        )

    @staticmethod
    def truncate_text(text: str, max_len: int) -> str:
        """Truncates string to max_len without breaking word bounds if possible."""
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

