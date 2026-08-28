import csv
import os
from typing import List, Dict, Any
from google_ads.models.campaign import CampaignBlueprint

class GoogleAdsBulkExporter:
    """
    Exports a CampaignBlueprint into official Google Ads Editor / Bulk Upload CSV format.
    Allows 1-click import into Google Ads UI or Google Ads Editor.
    """

    @classmethod
    def export_csv(cls, blueprint: CampaignBlueprint, output_path: str = "google_ads_bulk_upload.csv") -> str:
        rows = []

        # 1. Campaign Row
        rows.append({
            "Action": "Add",
            "Campaign": blueprint.campaign_name,
            "Campaign Type": "Search",
            "Campaign Status": "Paused",
            "Budget": str(blueprint.daily_budget_inr),
            "Bid Strategy Type": blueprint.bidding_strategy,
            "Networks": "Google search",
            "Languages": blueprint.language_name,
            "Location": blueprint.location_name
        })

        # 2. Ad Group Rows
        for ag in blueprint.ad_groups:
            rows.append({
                "Action": "Add",
                "Campaign": blueprint.campaign_name,
                "Ad Group": ag.ad_group_name,
                "Ad Group Status": "Enabled",
                "Max CPC": str(ag.cpc_bid_inr)
            })

            # Keywords
            all_kws = [ag.primary_keyword] + ag.variant_keywords
            for kw in all_kws:
                for match in ag.match_types:
                    match_formatted = kw
                    if match == "EXACT":
                        match_formatted = f"[{kw}]"
                    elif match == "PHRASE":
                        match_formatted = f'"{kw}"'

                    rows.append({
                        "Action": "Add",
                        "Campaign": blueprint.campaign_name,
                        "Ad Group": ag.ad_group_name,
                        "Keyword": match_formatted,
                        "Criterion Type": match.title(),
                        "Status": "Enabled",
                        "Max CPC": str(ag.cpc_bid_inr)
                    })

            # Ad Group Negative Keywords
            for neg in ag.negative_keywords:
                rows.append({
                    "Action": "Add",
                    "Campaign": blueprint.campaign_name,
                    "Ad Group": ag.ad_group_name,
                    "Keyword": f"[{neg.text}]" if neg.match_type == "EXACT" else neg.text,
                    "Criterion Type": "Negative",
                    "Status": "Enabled"
                })

            # RSA Ad
            rsa = ag.responsive_search_ad
            ad_row = {
                "Action": "Add",
                "Campaign": blueprint.campaign_name,
                "Ad Group": ag.ad_group_name,
                "Ad Type": "Responsive search ad",
                "Final URL": rsa.final_urls[0] if rsa.final_urls else blueprint.landing_page_url,
                "Path 1": rsa.path1,
                "Path 2": rsa.path2,
                "Status": "Enabled"
            }
            for i, h in enumerate(rsa.headlines[:15], 1):
                ad_row[f"Headline {i}"] = h.text
                if h.pinned_field:
                    ad_row[f"Headline {i} position"] = h.pinned_field

            for i, d in enumerate(rsa.descriptions[:4], 1):
                ad_row[f"Description {i}"] = d.text

            rows.append(ad_row)

        # 3. Campaign Negative Keywords
        for neg in blueprint.campaign_negative_keywords:
            rows.append({
                "Action": "Add",
                "Campaign": blueprint.campaign_name,
                "Keyword": neg.text,
                "Criterion Type": "Campaign Negative",
                "Status": "Enabled"
            })

        # 4. Sitelink Assets
        for s in blueprint.assets.sitelinks:
            rows.append({
                "Action": "Add",
                "Campaign": blueprint.campaign_name,
                "Asset Type": "Sitelink",
                "Link Text": s.text,
                "Description Line 1": s.description1,
                "Description Line 2": s.description2,
                "Final URL": s.final_url
            })

        # 5. Callout Assets
        for c in blueprint.assets.callouts:
            rows.append({
                "Action": "Add",
                "Campaign": blueprint.campaign_name,
                "Asset Type": "Callout",
                "Callout Text": c.text
            })

        # 6. Structured Snippets
        for snip in blueprint.assets.structured_snippets:
            rows.append({
                "Action": "Add",
                "Campaign": blueprint.campaign_name,
                "Asset Type": "Structured Snippet",
                "Header": snip.header,
                "Values": "; ".join(snip.values)
            })

        # Collect all field names
        fieldnames = []
        for r in rows:
            for k in r.keys():
                if k not in fieldnames:
                    fieldnames.append(k)

        with open(output_path, "w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            for r in rows:
                writer.writerow(r)

        return output_path
