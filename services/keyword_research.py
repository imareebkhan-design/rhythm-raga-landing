import json
import urllib.request
import urllib.parse
from typing import List, Dict, Any, Optional
from google_ads_config import GoogleAdsConfig

class KeywordResearchService:
    """Service to discover keyword ideas and historical search metrics via Google Ads API."""

    @classmethod
    def generate_keyword_ideas(
        cls,
        seed_keywords: List[str],
        geo_target_id: Optional[str] = None,
        language_id: Optional[str] = None,
        page_url: Optional[str] = None,
        use_api_if_available: bool = True
    ) -> List[Dict[str, Any]]:
        """
        Generates keyword ideas and metrics.
        Returns a list of dicts:
        [{
            'keyword': 'guitar classes near me',
            'avg_monthly_searches': 1300,
            'competition': 'HIGH',
            'competition_index': 85,
            'low_top_of_page_bid_cpc': 25.50,
            'high_top_of_page_bid_cpc': 68.00,
            'intent_score': 9,
            'recommended_match': 'Phrase'
        }]
        """
        geo_target_id = geo_target_id or GoogleAdsConfig.DEFAULT_GEO_TARGET
        language_id = language_id or GoogleAdsConfig.DEFAULT_LANGUAGE

        # If live credentials exist and API requested, call Google Ads API REST endpoint
        if use_api_if_available and GoogleAdsConfig.is_configured():
            try:
                api_results = cls._fetch_from_google_ads_api(
                    seed_keywords=seed_keywords,
                    geo_target_id=geo_target_id,
                    language_id=language_id,
                    page_url=page_url
                )
                if api_results:
                    return api_results
            except Exception as e:
                print(f"⚠️ Live API call failed ({e}). Falling back to heuristic research generator.")

        # Fallback / Dry-run keyword expansion generator
        return cls._generate_heuristic_keyword_ideas(seed_keywords, page_url)

    @classmethod
    def _fetch_from_google_ads_api(
        cls,
        seed_keywords: List[str],
        geo_target_id: str,
        language_id: str,
        page_url: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Calls Google Ads API generateKeywordIdeas endpoint."""
        customer_id = GoogleAdsConfig.CUSTOMER_ID
        url = f"{GoogleAdsConfig.BASE_URL}/customers/{customer_id}:generateKeywordIdeas"
        headers = GoogleAdsConfig.get_headers()

        payload: Dict[str, Any] = {
            "customerId": customer_id,
            "language": f"languageConstants/{language_id}",
            "geoTargetConstants": [f"geoTargetConstants/{geo_target_id}"],
            "keywordPlanNetwork": "GOOGLE_SEARCH",
        }

        if seed_keywords and page_url:
            payload["keywordAndUrlSeed"] = {
                "keywords": seed_keywords,
                "url": page_url
            }
        elif seed_keywords:
            payload["keywordSeed"] = {
                "keywords": seed_keywords
            }
        elif page_url:
            payload["urlSeed"] = {
                "url": page_url
            }

        req_data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(url, data=req_data, headers=headers, method="POST")

        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            results = []
            
            # Google Ads API returns 'results' array
            for item in data.get("results", []):
                text = item.get("text", "")
                metrics = item.get("keywordIdeaMetrics", {})
                
                avg_searches = int(metrics.get("avgMonthlySearches", 0))
                competition = metrics.get("competition", "UNSPECIFIED")
                comp_index = int(metrics.get("competitionIndex", 50))
                
                low_bid_micros = int(metrics.get("lowTopOfPageBidMicros", 0))
                high_bid_micros = int(metrics.get("highTopOfPageBidMicros", 0))
                
                low_cpc = round(low_bid_micros / 1_000_000, 2) if low_bid_micros else 15.0
                high_cpc = round(high_bid_micros / 1_000_000, 2) if high_bid_micros else 60.0
                
                results.append({
                    "keyword": text,
                    "avg_monthly_searches": avg_searches,
                    "competition": competition,
                    "competition_index": comp_index,
                    "low_top_of_page_bid_cpc": low_cpc,
                    "high_top_of_page_bid_cpc": high_cpc,
                    "intent_score": cls._calculate_intent_score(text),
                    "recommended_match": "Phrase" if "near me" in text.lower() or "in" in text.lower() else "Exact"
                })

            # Sort by intent score (descending) then monthly searches
            results.sort(key=lambda x: (x["intent_score"], x["avg_monthly_searches"]), reverse=True)
            return results

    @classmethod
    def _generate_heuristic_keyword_ideas(
        cls,
        seed_keywords: List[str],
        page_url: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """Generates structured keyword matrices for testing and preview without live API access."""
        modifiers_local = ["near me", "in GTB Nagar", "Hudson Lane", "North Campus", "Kamla Nagar", "Mukherjee Nagar"]
        modifiers_commercial = ["classes", "academy", "coaching", "lessons", "institute", "teacher", "for beginners"]

        expanded = []
        seen = set()

        for raw_seed in seed_keywords:
            clean_seed = raw_seed.strip().lower()
            
            # Base variations
            candidates = [
                f"{clean_seed} near me",
                f"{clean_seed} in gtb nagar",
                f"{clean_seed} hudson lane",
                f"{clean_seed} classes near me",
                f"{clean_seed} academy near me",
                f"{clean_seed} for beginners",
                f"best {clean_seed} in delhi",
                f"{clean_seed} teacher near me",
                f"{clean_seed} north campus",
                clean_seed
            ]

            for cand in candidates:
                if cand not in seen:
                    seen.add(cand)
                    intent = cls._calculate_intent_score(cand)
                    # Synthetic metrics tailored to Delhi market benchmark ranges
                    expanded.append({
                        "keyword": cand,
                        "avg_monthly_searches": 480 if "near me" in cand else (240 if "gtb" in cand else 110),
                        "competition": "HIGH" if intent >= 8 else "MEDIUM",
                        "competition_index": 75 if intent >= 8 else 50,
                        "low_top_of_page_bid_cpc": 18.0 if intent >= 8 else 12.0,
                        "high_top_of_page_bid_cpc": 65.0 if intent >= 8 else 45.0,
                        "intent_score": intent,
                        "recommended_match": "Phrase"
                    })

        expanded.sort(key=lambda x: x["intent_score"], reverse=True)
        return expanded

    @staticmethod
    def _calculate_intent_score(keyword: str) -> int:
        """Evaluates commercial and local search intent on a 1-10 scale."""
        kw = keyword.lower()
        score = 5
        
        # High intent local & commercial signals
        if "near me" in kw:
            score += 3
        if any(loc in kw for loc in ["gtb nagar", "hudson lane", "kamla nagar", "north campus"]):
            score += 3
        if any(comm in kw for comm in ["classes", "academy", "lessons", "coaching", "teacher", "fees"]):
            score += 1
        if "for beginners" in kw:
            score += 1
            
        # Informational reductions
        if any(info in kw for info in ["free download", "pdf", "chords", "tab", "history", "what is"]):
            score -= 4

        return min(10, max(1, score))
