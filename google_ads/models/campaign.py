from dataclasses import dataclass, field, asdict
from enum import Enum
from typing import List, Dict, Any, Optional

class IntentCategory(str, Enum):
    HIGH_COMMERCIAL_LOCAL = "HIGH_COMMERCIAL_LOCAL"
    COMMERCIAL_INVESTIGATION = "COMMERCIAL_INVESTIGATION"
    LOCAL_SERVICE = "LOCAL_SERVICE"
    INFORMATIONAL = "INFORMATIONAL"
    NAVIGATIONAL = "NAVIGATIONAL"
    LOW_INTENT = "LOW_INTENT"
    IRRELEVANT = "IRRELEVANT"

@dataclass
class CampaignRequest:
    business: str
    service: str
    location: str
    budget: float
    objective: str = "lead_generation"
    landing_page_url: str = "https://www.rhytthmraga.com"
    language: str = "English"
    bidding_strategy: str = "MANUAL_CPC"
    max_skags: int = 5
    enable_broad_match: bool = False
    headline_pinning_mode: str = "HEADLINE_1_EXACT"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class KeywordMetrics:
    avg_monthly_searches: int = 0
    competition: str = "UNSPECIFIED"  # HIGH, MEDIUM, LOW, UNSPECIFIED
    competition_index: int = 50
    low_top_of_page_bid_cpc: float = 15.0
    high_top_of_page_bid_cpc: float = 60.0

@dataclass
class KeywordScore:
    intent_category: IntentCategory
    intent_score: float  # 0-100
    location_relevance: float  # 0-100
    commercial_relevance: float  # 0-100
    overall_score: float  # 0-100
    rationale: str = ""

@dataclass
class KeywordIdea:
    keyword: str
    metrics: KeywordMetrics
    score: KeywordScore
    recommended_match_types: List[str] = field(default_factory=lambda: ["EXACT", "PHRASE"])

    def to_dict(self) -> Dict[str, Any]:
        return {
            "keyword": self.keyword,
            "avg_monthly_searches": self.metrics.avg_monthly_searches,
            "competition": self.metrics.competition,
            "competition_index": self.metrics.competition_index,
            "low_top_of_page_bid_cpc": self.metrics.low_top_of_page_bid_cpc,
            "high_top_of_page_bid_cpc": self.metrics.high_top_of_page_bid_cpc,
            "intent_category": self.score.intent_category.value,
            "intent_score": round(self.score.intent_score, 1),
            "overall_score": round(self.score.overall_score, 1),
            "rationale": self.score.rationale,
            "recommended_match_types": self.recommended_match_types
        }

@dataclass
class KeywordCluster:
    theme_name: str
    primary_keyword: str
    variant_keywords: List[str] = field(default_factory=list)
    intent: IntentCategory = IntentCategory.HIGH_COMMERCIAL_LOCAL
    landing_page_url: str = "https://www.rhytthmraga.com"

@dataclass
class NegativeKeyword:
    text: str
    match_type: str = "BROAD"  # BROAD, PHRASE, EXACT
    level: str = "CAMPAIGN"    # CAMPAIGN, AD_GROUP
    ad_group_name: Optional[str] = None
    reason: str = "Obvious non-commercial or low-intent search"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class AdAsset:
    text: str
    pinned_field: Optional[str] = None  # e.g., "HEADLINE_1"

    def to_dict(self) -> Dict[str, Any]:
        d = {"text": self.text}
        if self.pinned_field:
            d["pinned_field"] = self.pinned_field
        return d

@dataclass
class ResponsiveSearchAd:
    final_urls: List[str]
    path1: str = ""
    path2: str = ""
    headlines: List[AdAsset] = field(default_factory=list)
    descriptions: List[AdAsset] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "final_urls": self.final_urls,
            "path1": self.path1,
            "path2": self.path2,
            "headlines": [h.to_dict() for h in self.headlines],
            "descriptions": [d.to_dict() for d in self.descriptions]
        }

@dataclass
class SitelinkAsset:
    text: str
    description1: str
    description2: str
    final_url: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class CalloutAsset:
    text: str

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class StructuredSnippetAsset:
    header: str
    values: List[str]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class CallAsset:
    phone_number: str
    country_code: str = "IN"

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class CampaignAssets:
    sitelinks: List[SitelinkAsset] = field(default_factory=list)
    callouts: List[CalloutAsset] = field(default_factory=list)
    structured_snippets: List[StructuredSnippetAsset] = field(default_factory=list)
    call_asset: Optional[CallAsset] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "sitelinks": [s.to_dict() for s in self.sitelinks],
            "callouts": [c.to_dict() for c in self.callouts],
            "structured_snippets": [ss.to_dict() for ss in self.structured_snippets],
            "call_asset": self.call_asset.to_dict() if self.call_asset else None
        }

@dataclass
class AdGroupBlueprint:
    ad_group_name: str
    primary_keyword: str
    variant_keywords: List[str]
    cpc_bid_inr: float
    match_types: List[str]
    responsive_search_ad: ResponsiveSearchAd
    negative_keywords: List[NegativeKeyword] = field(default_factory=list)
    rationale: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "ad_group_name": self.ad_group_name,
            "primary_keyword": self.primary_keyword,
            "variant_keywords": self.variant_keywords,
            "cpc_bid_inr": self.cpc_bid_inr,
            "match_types": self.match_types,
            "responsive_search_ad": self.responsive_search_ad.to_dict(),
            "negative_keywords": [n.to_dict() for n in self.negative_keywords],
            "rationale": self.rationale
        }

@dataclass
class CampaignBlueprint:
    version: str = "1.0"
    business: str = ""
    offer: str = ""
    objective: str = "lead_generation"
    daily_budget_inr: float = 500.0
    daily_budget_micros: int = 500_000_000
    currency: str = "INR"
    location_name: str = "GTB Nagar, Delhi"
    geo_target_id: str = "1007788"
    language_name: str = "English"
    language_id: str = "1000"
    bidding_strategy: str = "MANUAL_CPC"
    campaign_name: str = ""
    campaign_type: str = "SEARCH"
    landing_page_url: str = "https://www.rhytthmraga.com"
    ad_groups: List[AdGroupBlueprint] = field(default_factory=list)
    campaign_negative_keywords: List[NegativeKeyword] = field(default_factory=list)
    assets: CampaignAssets = field(default_factory=CampaignAssets)
    tracking_configuration: Dict[str, Any] = field(default_factory=dict)
    validation_results: Dict[str, Any] = field(default_factory=dict)
    approval_status: str = "PENDING"  # PENDING, APPROVED, REJECTED

    def to_dict(self) -> Dict[str, Any]:
        return {
            "version": self.version,
            "business": self.business,
            "offer": self.offer,
            "objective": self.objective,
            "daily_budget_inr": self.daily_budget_inr,
            "daily_budget_micros": self.daily_budget_micros,
            "currency": self.currency,
            "location_name": self.location_name,
            "geo_target_id": self.geo_target_id,
            "language_name": self.language_name,
            "language_id": self.language_id,
            "bidding_strategy": self.bidding_strategy,
            "campaign_name": self.campaign_name,
            "campaign_type": self.campaign_type,
            "landing_page_url": self.landing_page_url,
            "ad_groups_count": len(self.ad_groups),
            "ad_groups": [ag.to_dict() for ag in self.ad_groups],
            "campaign_negative_keywords": [n.to_dict() for n in self.campaign_negative_keywords],
            "assets": self.assets.to_dict(),
            "tracking_configuration": self.tracking_configuration,
            "validation_results": self.validation_results,
            "approval_status": self.approval_status
        }

@dataclass
class ValidationResult:
    is_valid: bool
    local_errors: List[str] = field(default_factory=list)
    local_warnings: List[str] = field(default_factory=list)
    google_api_valid: Optional[bool] = None
    google_api_errors: List[str] = field(default_factory=list)
    landing_page_valid: Optional[bool] = None
    landing_page_warnings: List[str] = field(default_factory=list)

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class LaunchResult:
    status: str  # DRY_RUN_SUCCESS, LIVE_LAUNCH_SUCCESS, VALIDATION_FAILED, API_EXECUTION_ERROR, REJECTED_BY_USER
    mode: str
    campaign_name: str
    campaign_id: Optional[str] = None
    campaign_resource_name: Optional[str] = None
    budget_id: Optional[str] = None
    budget_resource_name: Optional[str] = None
    ad_group_ids: List[str] = field(default_factory=list)
    keyword_ids: List[str] = field(default_factory=list)
    ad_ids: List[str] = field(default_factory=list)
    execution_steps: List[Dict[str, Any]] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)
    blueprint: Optional[Dict[str, Any]] = None

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)

@dataclass
class AuditRecord:
    timestamp: str
    user_input: Dict[str, Any]
    keyword_research_params: Dict[str, Any]
    keywords_returned_count: int
    keywords_selected_count: int
    negative_keywords_count: int
    campaign_blueprint: Dict[str, Any]
    validation_result: Dict[str, Any]
    approval_result: str
    launch_result: Dict[str, Any]

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)
