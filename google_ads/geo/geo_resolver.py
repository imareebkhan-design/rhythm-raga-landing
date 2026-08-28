from typing import Dict, Optional, Tuple
from google_ads.config import Config
from google_ads.client.ads_client import GoogleAdsClient

class GeoResolver:
    """
    Resolves human-readable location strings to official Google Ads GeoTargetConstant IDs.
    """

    KNOWN_GEO_CONSTANTS: Dict[str, Tuple[str, str]] = {
        "delhi": ("1007788", "Delhi, India"),
        "gtb nagar": ("1007788", "Delhi, India"),
        "hudson lane": ("1007788", "Delhi, India"),
        "north delhi": ("1007788", "Delhi, India"),
        "gurgaon": ("1007789", "Gurgaon, Haryana, India"),
        "gurugram": ("1007789", "Gurgaon, Haryana, India"),
        "noida": ("1007790", "Noida, Uttar Pradesh, India"),
        "mumbai": ("1007785", "Mumbai, Maharashtra, India"),
        "bangalore": ("1007768", "Bengaluru, Karnataka, India"),
        "bengaluru": ("1007768", "Bengaluru, Karnataka, India"),
        "india": ("2356", "India")
    }

    @classmethod
    def resolve_location(cls, location_name: str) -> Tuple[str, str]:
        """
        Returns (geo_target_id, canonical_name).
        """
        loc_clean = location_name.strip().lower()

        # 1. Direct lookup in static table
        for key, val in cls.KNOWN_GEO_CONSTANTS.items():
            if key in loc_clean:
                return val

        # 2. Try Google Ads suggest endpoint if API configured
        if Config.is_configured():
            try:
                resp = GoogleAdsClient.suggest_geo_targets([location_name])
                geo_targets = resp.get("geoTargetConstantSuggestions", [])
                if geo_targets:
                    suggested = geo_targets[0].get("geoTargetConstant", {})
                    target_id = suggested.get("id")
                    canonical_name = suggested.get("canonicalName", location_name)
                    if target_id:
                        return str(target_id), canonical_name
            except Exception as e:
                print(f"⚠️ GeoTargetConstant suggest API lookup failed ({e}). Using default.")

        # Fallback to default configured location
        return Config.DEFAULT_GEO_TARGET, f"{location_name} (Resolved to default {Config.DEFAULT_GEO_TARGET})"
