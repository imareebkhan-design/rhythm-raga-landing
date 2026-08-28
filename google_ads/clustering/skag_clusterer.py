from typing import List, Dict, Any
from google_ads.config import Config
from google_ads.models.campaign import KeywordIdea, KeywordCluster, IntentCategory

class SKAGClusterer:
    """
    Groups qualified keywords into tightly themed SKAG ad groups.
    Prevents unnecessary ad group proliferation by clustering closely related variants.
    """

    @classmethod
    def create_clusters(
        cls,
        qualified_ideas: List[KeywordIdea],
        landing_page_url: str,
        max_skags: int = 5
    ) -> List[KeywordCluster]:
        """
        Takes qualified, scored KeywordIdeas and clusters them into distinct SKAG themes.
        """
        if not qualified_ideas:
            return []

        clusters: List[KeywordCluster] = []
        assigned_keywords = set()

        for idea in qualified_ideas:
            kw = idea.keyword.strip().lower()
            if kw in assigned_keywords:
                continue

            # Check if kw fits as a variant of an existing cluster
            matched_existing = False
            for cluster in clusters:
                if cls._is_close_variant(kw, cluster.primary_keyword):
                    cluster.variant_keywords.append(kw)
                    assigned_keywords.add(kw)
                    matched_existing = True
                    break

            if matched_existing:
                continue

            # Stop creating new clusters if max_skags reached
            if len(clusters) >= max_skags:
                break

            # Create a new theme cluster
            theme_name = f"SKAG - {kw.title()}"
            cluster = KeywordCluster(
                theme_name=theme_name,
                primary_keyword=kw,
                variant_keywords=[],
                intent=idea.score.intent_category,
                landing_page_url=landing_page_url
            )
            clusters.append(cluster)
            assigned_keywords.add(kw)

        return clusters

    @classmethod
    def get_match_types(cls, enable_broad: bool = False) -> List[str]:
        """Returns active match types based on configuration."""
        types = []
        if Config.ENABLE_EXACT_MATCH:
            types.append("EXACT")
        if Config.ENABLE_PHRASE_MATCH:
            types.append("PHRASE")
        if enable_broad or Config.ENABLE_BROAD_MATCH:
            types.append("BROAD")
        return types or ["EXACT", "PHRASE"]

    @staticmethod
    def _is_close_variant(kw1: str, kw2: str) -> bool:
        """Determines if two keywords share the exact core tokens and are tight variants."""
        tokens1 = set(w for w in kw1.split() if w not in {"in", "at", "for", "the", "a", "near", "me"})
        tokens2 = set(w for w in kw2.split() if w not in {"in", "at", "for", "the", "a", "near", "me"})
        
        # If tokens match almost completely, consider them variants
        if tokens1 and tokens1 == tokens2:
            return True
        return False
