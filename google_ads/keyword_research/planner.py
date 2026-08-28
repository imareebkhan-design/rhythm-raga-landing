from typing import List, Dict, Any, Optional
from google_ads.config import Config
from google_ads.client.ads_client import GoogleAdsClient
from google_ads.keyword_scoring.scorer import KeywordScorer
from google_ads.models.campaign import KeywordIdea, KeywordMetrics, IntentCategory

class KeywordPlannerService:
    """Service to discover and score keyword ideas via Google Ads API or heuristic fallback."""

    @classmethod
    def fetch_keyword_ideas(
        cls,
        seed_keywords: Optional[List[str]] = None,
        page_url: Optional[str] = None,
        geo_target_id: Optional[str] = None,
        language_id: Optional[str] = None,
        target_service: str = "",
        target_location: str = "",
        use_api_if_available: bool = True
    ) -> List[KeywordIdea]:
        """
        Generates keyword ideas using Google Ads API KeywordPlanIdeaService (or fallback).
        """
        geo_target_id = geo_target_id or Config.DEFAULT_GEO_TARGET
        language_id = language_id or Config.DEFAULT_LANGUAGE
        seed_keywords = seed_keywords or []

        if use_api_if_available and Config.is_configured():
            try:
                api_ideas = cls._fetch_from_api(
                    seed_keywords=seed_keywords,
                    page_url=page_url,
                    geo_target_id=geo_target_id,
                    language_id=language_id,
                    target_service=target_service,
                    target_location=target_location
                )
                if api_ideas:
                    return api_ideas
            except Exception as e:
                print(f"⚠️ Live Keyword Planner API call failed ({e}). Falling back to heuristic research generator.")

        return cls._generate_heuristic_keyword_ideas(
            seed_keywords=seed_keywords,
            page_url=page_url,
            target_service=target_service,
            target_location=target_location
        )

    @classmethod
    def _fetch_from_api(
        cls,
        seed_keywords: List[str],
        page_url: Optional[str],
        geo_target_id: str,
        language_id: str,
        target_service: str,
        target_location: str
    ) -> List[KeywordIdea]:
        payload: Dict[str, Any] = {
            "language": f"languageConstants/{language_id}",
            "geoTargetConstants": [f"geoTargetConstants/{geo_target_id}"],
            "keywordPlanNetwork": "GOOGLE_SEARCH",
        }

        if seed_keywords and page_url:
            payload["keywordAndUrlSeed"] = {"keywords": seed_keywords, "url": page_url}
        elif seed_keywords:
            payload["keywordSeed"] = {"keywords": seed_keywords}
        elif page_url:
            payload["urlSeed"] = {"url": page_url}

        data = GoogleAdsClient.generate_keyword_ideas(payload)
        results: List[KeywordIdea] = []

        for item in data.get("results", []):
            text = item.get("text", "")
            if not text:
                continue

            metrics_raw = item.get("keywordIdeaMetrics", {})
            avg_searches = int(metrics_raw.get("avgMonthlySearches", 0))
            competition = metrics_raw.get("competition", "UNSPECIFIED")
            comp_index = int(metrics_raw.get("competitionIndex", 50))
            low_bid = round(int(metrics_raw.get("lowTopOfPageBidMicros", 0)) / 1_000_000, 2) or 15.0
            high_bid = round(int(metrics_raw.get("highTopOfPageBidMicros", 0)) / 1_000_000, 2) or 60.0

            metrics = KeywordMetrics(
                avg_monthly_searches=avg_searches,
                competition=competition,
                competition_index=comp_index,
                low_top_of_page_bid_cpc=low_bid,
                high_top_of_page_bid_cpc=high_bid
            )

            score = KeywordScorer.evaluate(
                keyword=text,
                metrics=metrics,
                target_service=target_service,
                target_location=target_location
            )

            if score.intent_category != IntentCategory.IRRELEVANT:
                match_types = ["EXACT", "PHRASE"]
                results.append(KeywordIdea(
                    keyword=text,
                    metrics=metrics,
                    score=score,
                    recommended_match_types=match_types
                ))

        results.sort(key=lambda x: x.score.overall_score, reverse=True)
        return results

    @classmethod
    def _generate_heuristic_keyword_ideas(
        cls,
        seed_keywords: List[str],
        page_url: Optional[str],
        target_service: str,
        target_location: str
    ) -> List[KeywordIdea]:
        """Generates synthetic/mock keyword ideas when API is unavailable."""
        base_term = seed_keywords[0] if seed_keywords else (target_service or "guitar classes")
        clean_base = base_term.strip().lower()

        candidates = [
            f"{clean_base} near me",
            f"{clean_base} in gtb nagar",
            f"{clean_base} hudson lane",
            f"best {clean_base} academy delhi",
            f"{clean_base} for beginners",
            f"{clean_base} teacher near me",
            f"{clean_base} coaching north campus",
            f"{clean_base} fees gtb nagar",
            f"how to learn {clean_base}",
            f"{clean_base} salary in india",
            f"free {clean_base} pdf download"
        ]

        results: List[KeywordIdea] = []
        seen = set()

        for cand in candidates:
            if cand in seen:
                continue
            seen.add(cand)

            if "near me" in cand:
                vol, comp, comp_idx, low_b, high_b = 720, "HIGH", 85, 25.0, 75.0
            elif "gtb nagar" in cand or "hudson lane" in cand:
                vol, comp, comp_idx, low_b, high_b = 480, "HIGH", 80, 22.0, 65.0
            elif "best" in cand or "fees" in cand:
                vol, comp, comp_idx, low_b, high_b = 320, "MEDIUM", 65, 18.0, 50.0
            elif "free" in cand or "salary" in cand:
                vol, comp, comp_idx, low_b, high_b = 150, "LOW", 20, 5.0, 15.0
            else:
                vol, comp, comp_idx, low_b, high_b = 210, "MEDIUM", 50, 15.0, 40.0

            metrics = KeywordMetrics(
                avg_monthly_searches=vol,
                competition=comp,
                competition_index=comp_idx,
                low_top_of_page_bid_cpc=low_b,
                high_top_of_page_bid_cpc=high_b
            )

            score = KeywordScorer.evaluate(
                keyword=cand,
                metrics=metrics,
                target_service=target_service or clean_base,
                target_location=target_location or "GTB Nagar, Delhi"
            )

            if score.intent_category != IntentCategory.IRRELEVANT:
                results.append(KeywordIdea(
                    keyword=cand,
                    metrics=metrics,
                    score=score,
                    recommended_match_types=["EXACT", "PHRASE"]
                ))

        results.sort(key=lambda x: x.score.overall_score, reverse=True)
        return results
