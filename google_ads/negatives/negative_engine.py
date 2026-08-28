from typing import List, Dict, Any
from google_ads.models.campaign import NegativeKeyword, KeywordCluster

class NegativeKeywordEngine:
    """
    Generates campaign-level and ad-group-level negative keywords and resolves cross-theme conflicts.
    """

    GLOBAL_CAMPAIGN_NEGATIVES = [
        "free chords", "free tabs", "free pdf", "free notes", "free download", "free lyrics", "free tutorial", "free sheet music",
        "jobs", "job", "salary", "vacancy", "career", "hiring", "recruitment", "tutor vacancy",
        "pdf", "youtube", "tutorial", "lyrics", "chords", "tabs", "definition", "meaning",
        "download", "book", "used", "second hand", "olx", "quikr", "wikipedia",
        "zoom classes", "online course", "online classes only", "software", "virtual class"
    ]

    SERVICE_SPECIFIC_NEGATIVES = {
        "guitar": ["violin", "piano", "flute", "drums", "vocal", "singing"],
        "piano": ["guitar", "violin", "flute", "drums", "vocal", "singing"],
        "vocal": ["guitar", "violin", "piano", "flute", "drums"],
        "singing": ["guitar", "violin", "piano", "flute", "drums"],
        "drum": ["guitar", "piano", "flute", "violin", "singing", "vocal"],
        "drums": ["guitar", "piano", "flute", "violin", "singing", "vocal"],
        "music": ["sports", "swimming", "karate"]
    }

    @classmethod
    def generate_campaign_negatives(
        cls,
        business: str,
        service: str
    ) -> List[NegativeKeyword]:
        """
        Generates global and context-aware campaign-level negative keywords.
        """
        negatives: List[NegativeKeyword] = []
        seen = set()

        # 1. Global non-commercial negatives
        for word in cls.GLOBAL_CAMPAIGN_NEGATIVES:
            if word not in seen:
                seen.add(word)
                negatives.append(NegativeKeyword(
                    text=word,
                    match_type="BROAD",
                    level="CAMPAIGN",
                    reason="Global non-commercial / low-intent filter"
                ))

        # 2. Service-specific cross-instrument / cross-service negatives
        service_lower = service.lower()
        for key, unrelated_terms in cls.SERVICE_SPECIFIC_NEGATIVES.items():
            if key in service_lower:
                for term in unrelated_terms:
                    if term not in service_lower and term not in seen:
                        seen.add(term)
                        negatives.append(NegativeKeyword(
                            text=term,
                            match_type="EXACT",
                            level="CAMPAIGN",
                            reason=f"Prevent irrelevance for {service} campaign"
                        ))

        return negatives

    @classmethod
    def resolve_cross_theme_conflicts(
        cls,
        clusters: List[KeywordCluster]
    ) -> Dict[str, List[NegativeKeyword]]:
        """
        Generates ad-group level exact negative keywords to prevent cross-theme cannibalization between SKAG ad groups.
        Returns a dict mapping ad group theme_name -> List[NegativeKeyword].
        """
        ad_group_negatives: Dict[str, List[NegativeKeyword]] = {c.theme_name: [] for c in clusters}

        # For each cluster, add other clusters' exact primary keywords as ad-group exact negatives if they differ
        for i, source_cluster in enumerate(clusters):
            for j, target_cluster in enumerate(clusters):
                if i == j:
                    continue
                # If target primary keyword is distinct and contains specific location/modifier, prevent source from triggering it
                target_kw = target_cluster.primary_keyword
                if target_kw != source_cluster.primary_keyword:
                    ad_group_negatives[source_cluster.theme_name].append(NegativeKeyword(
                        text=target_kw,
                        match_type="EXACT",
                        level="AD_GROUP",
                        ad_group_name=source_cluster.theme_name,
                        reason=f"Prevent cross-theme competition with '{target_cluster.theme_name}'"
                    ))

        return ad_group_negatives
