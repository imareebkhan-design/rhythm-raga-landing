import re
from typing import Dict, Any, List
from google_ads.models.campaign import CampaignBlueprint, ValidationResult
from google_ads.bidding.strategy import BiddingStrategyValidator

class LocalValidator:
    """
    Performs fast, strict deterministic local validation on a CampaignBlueprint.
    """

    @classmethod
    def validate(cls, blueprint: CampaignBlueprint) -> ValidationResult:
        """
        Validates campaign structure, character limits, asset counts, and strategy.
        """
        errors: List[str] = []
        warnings: List[str] = []

        if not blueprint.campaign_name:
            errors.append("Campaign name is required.")

        if blueprint.daily_budget_inr <= 0:
            errors.append("Daily budget must be greater than 0.")

        # Validate bidding strategy
        strat_ok, strat_errs = BiddingStrategyValidator.validate(
            strategy=blueprint.bidding_strategy,
            daily_budget=blueprint.daily_budget_inr
        )
        if not strat_ok:
            errors.extend(strat_errs)

        if not blueprint.ad_groups:
            errors.append("Campaign must contain at least one SKAG ad group.")

        for idx, ag in enumerate(blueprint.ad_groups):
            ag_name = ag.ad_group_name or f"AdGroup_{idx}"
            if not ag.primary_keyword:
                errors.append(f"Ad group '{ag_name}' is missing a primary keyword.")

            rsa = ag.responsive_search_ad
            headlines = rsa.headlines
            descriptions = rsa.descriptions

            if len(headlines) < 3:
                errors.append(f"Ad group '{ag_name}' RSA has {len(headlines)} headlines (minimum 3 required).")
            if len(descriptions) < 2:
                errors.append(f"Ad group '{ag_name}' RSA has {len(descriptions)} descriptions (minimum 2 required).")

            # Check headline length & policy
            h_texts = set()
            for h in headlines:
                txt = h.text.strip()
                if len(txt) > 30:
                    errors.append(f"Headline '{txt}' in '{ag_name}' exceeds 30 chars ({len(txt)} chars).")
                if txt.lower() in h_texts:
                    warnings.append(f"Duplicate headline '{txt}' in ad group '{ag_name}'.")
                h_texts.add(txt.lower())

                if "!!!" in txt or "FREE FREE" in txt:
                    warnings.append(f"Potential policy warning (excessive punctuation/caps) in headline '{txt}'.")

            # Check description length & policy
            d_texts = set()
            for d in descriptions:
                txt = d.text.strip()
                if len(txt) > 90:
                    errors.append(f"Description '{txt}' in '{ag_name}' exceeds 90 chars ({len(txt)} chars).")
                if txt.lower() in d_texts:
                    warnings.append(f"Duplicate description '{txt}' in ad group '{ag_name}'.")
                d_texts.add(txt.lower())

        # Validate Campaign Assets (Sitelinks, Callouts, Snippets, Call)
        if blueprint.assets:
            sitelinks = blueprint.assets.sitelinks
            if len(sitelinks) < 4:
                warnings.append(f"Campaign has {len(sitelinks)} sitelinks. Google Ads recommends at least 4 sitelinks to maximize ad strength & CTR.")
            
            s_texts = set()
            for s in sitelinks:
                st = s.text.strip()
                if len(st) > 25:
                    errors.append(f"Sitelink text '{st}' exceeds 25 chars ({len(st)} chars).")
                if len(s.description1.strip()) > 35:
                    errors.append(f"Sitelink description 1 '{s.description1}' exceeds 35 chars ({len(s.description1)} chars).")
                if len(s.description2.strip()) > 35:
                    errors.append(f"Sitelink description 2 '{s.description2}' exceeds 35 chars ({len(s.description2)} chars).")
                if not s.final_url.startswith("http"):
                    errors.append(f"Sitelink '{st}' has invalid final_url: '{s.final_url}'")
                if st.lower() in s_texts:
                    warnings.append(f"Duplicate sitelink text '{st}'.")
                s_texts.add(st.lower())

            for c in blueprint.assets.callouts:
                ct = c.text.strip()
                if len(ct) > 25:
                    errors.append(f"Callout text '{ct}' exceeds 25 chars ({len(ct)} chars).")

            for snip in blueprint.assets.structured_snippets:
                if not snip.header:
                    errors.append("Structured snippet missing header.")
                for v in snip.values:
                    if len(v.strip()) > 25:
                        errors.append(f"Structured snippet value '{v}' exceeds 25 chars.")

            if blueprint.assets.call_asset:
                ph = blueprint.assets.call_asset.phone_number
                if not ph or len(re.sub(r'\D', '', ph)) < 8:
                    errors.append(f"Invalid phone number in call asset: '{ph}'")

        if not blueprint.campaign_negative_keywords:
            warnings.append("No campaign-level negative keywords defined.")

        is_valid = len(errors) == 0

        return ValidationResult(
            is_valid=is_valid,
            local_errors=errors,
            local_warnings=warnings
        )
