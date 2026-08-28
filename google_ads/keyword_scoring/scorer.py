import re
from typing import Dict, Any, List
from google_ads.config import Config
from google_ads.models.campaign import IntentCategory, KeywordScore, KeywordMetrics

class KeywordScorer:
    """
    Evaluates keyword intent and computes a transparent 100-point composite score.
    """

    IRRELEVANT_PATTERNS = [
        r"\bsalary\b", r"\bjob\b", r"\bjobs\b", r"\bvacancy\b", r"\bcareer\b",
        r"\bpdf\b", r"\bdownload\b", r"\bfree\b", r"\blyrics\b", r"\bchords\b",
        r"\btabs?\b", r"\btutorial\b", r"\bmeaning\b", r"\bdefinition\b",
        r"\bused\b", r"\bsecond hand\b", r"\bolx\b", r"\bquikr\b", r"\byoutube\b"
    ]

    HIGH_COMMERCIAL_PATTERNS = [
        r"\bnear me\b", r"\bclasses\b", r"\badmissions?\b", r"\bcoaching\b",
        r"\bacademy\b", r"\binstitute\b", r"\bfees?\b", r"\bjoin\b", r"\bhire\b",
        r"\bteacher\b", r"\btutor\b", r"\blessons\b", r"\bschool\b"
    ]

    COMMERCIAL_INVESTIGATION_PATTERNS = [
        r"\bbest\b", r"\btop\b", r"\breviews?\b", r"\brating\b", r"\bcost\b",
        r"\bprice\b", r"\bcomparison\b", r"\bvs\b", r"\brecommended\b"
    ]

    INFORMATIONAL_PATTERNS = [
        r"\bhow to\b", r"\bwhat is\b", r"\bguide\b", r"\btips\b", r"\bself learn\b",
        r"\beasy way to\b", r"\bhistory of\b", r"\btypes of\b"
    ]

    @classmethod
    def classify_intent(cls, keyword: str, location_hint: str = "") -> IntentCategory:
        """Categorizes search query intent into standard categories."""
        kw = keyword.lower().strip()
        loc = location_hint.lower().strip()

        # Check irrelevant
        for pat in cls.IRRELEVANT_PATTERNS:
            if re.search(pat, kw):
                return IntentCategory.IRRELEVANT

        # Check high commercial / local
        is_local = "near me" in kw or (loc and loc in kw) or any(
            area in kw for area in ["gtb nagar", "hudson lane", "kamla nagar", "north campus", "delhi", "gurgaon", "noida"]
        )
        is_commercial = any(re.search(pat, kw) for pat in cls.HIGH_COMMERCIAL_PATTERNS)

        if is_local and is_commercial:
            return IntentCategory.HIGH_COMMERCIAL_LOCAL
        elif is_local:
            return IntentCategory.LOCAL_SERVICE
        elif is_commercial:
            return IntentCategory.COMMERCIAL_INVESTIGATION

        if any(re.search(pat, kw) for pat in cls.COMMERCIAL_INVESTIGATION_PATTERNS):
            return IntentCategory.COMMERCIAL_INVESTIGATION

        if any(re.search(pat, kw) for pat in cls.INFORMATIONAL_PATTERNS):
            return IntentCategory.INFORMATIONAL

        return IntentCategory.LOW_INTENT

    @classmethod
    def evaluate(
        cls,
        keyword: str,
        metrics: KeywordMetrics,
        target_service: str = "",
        target_location: str = ""
    ) -> KeywordScore:
        """
        Calculates a transparent composite 100-point score for a keyword candidate.
        """
        kw = keyword.lower().strip()
        intent_cat = cls.classify_intent(kw, location_hint=target_location)

        # 1. Intent Base Score (0-100)
        intent_scores = {
            IntentCategory.HIGH_COMMERCIAL_LOCAL: 100.0,
            IntentCategory.LOCAL_SERVICE: 85.0,
            IntentCategory.COMMERCIAL_INVESTIGATION: 75.0,
            IntentCategory.INFORMATIONAL: 30.0,
            IntentCategory.NAVIGATIONAL: 40.0,
            IntentCategory.LOW_INTENT: 20.0,
            IntentCategory.IRRELEVANT: 0.0
        }
        raw_intent = intent_scores.get(intent_cat, 50.0)

        # 2. Location Relevance Score (0-100)
        loc_words = [w for w in re.split(r"\W+", target_location.lower()) if len(w) > 2]
        loc_match_count = sum(1 for w in loc_words if w in kw)
        if "near me" in kw or (loc_words and loc_match_count > 0):
            location_score = 100.0
        elif any(delhi_area in kw for delhi_area in ["gtb nagar", "north campus", "hudson lane", "delhi"]):
            location_score = 80.0
        else:
            location_score = 50.0

        # 3. Commercial Relevance Score (0-100)
        service_words = [w for w in re.split(r"\W+", target_service.lower()) if len(w) > 2]
        service_match_count = sum(1 for w in service_words if w in kw)
        if service_words and service_match_count >= len(service_words):
            commercial_score = 100.0
        elif service_match_count > 0:
            commercial_score = 75.0
        else:
            commercial_score = 40.0

        # 4. Volume Score (0-100)
        vol = metrics.avg_monthly_searches
        if vol >= 1000:
            volume_score = 100.0
        elif vol >= 300:
            volume_score = 85.0
        elif vol >= 100:
            volume_score = 70.0
        elif vol >= 20:
            volume_score = 50.0
        else:
            volume_score = 30.0

        # 5. Competition Score (0-100)
        comp_idx = metrics.competition_index
        # High competition index indicates high advertiser demand
        comp_score = float(min(100, max(10, comp_idx)))

        # 6. Specificity Score (0-100)
        word_count = len(kw.split())
        if 3 <= word_count <= 5:
            specificity_score = 100.0
        elif word_count == 2 or word_count == 6:
            specificity_score = 75.0
        else:
            specificity_score = 50.0

        # Weighted Overall Score
        overall = (
            raw_intent * Config.WEIGHT_INTENT +
            location_score * Config.WEIGHT_LOCATION +
            commercial_score * Config.WEIGHT_COMMERCIAL +
            volume_score * Config.WEIGHT_VOLUME +
            comp_score * Config.WEIGHT_COMPETITION +
            specificity_score * Config.WEIGHT_SPECIFICITY
        )

        overall = min(100.0, max(0.0, overall))

        rationale = (
            f"Intent: {intent_cat.value} ({raw_intent:.0f}), "
            f"Loc: {location_score:.0f}, Comm: {commercial_score:.0f}, "
            f"Vol: {vol}/mo, CompIdx: {comp_idx}"
        )

        return KeywordScore(
            intent_category=intent_cat,
            intent_score=raw_intent,
            location_relevance=location_score,
            commercial_relevance=commercial_score,
            overall_score=round(overall, 1),
            rationale=rationale
        )
