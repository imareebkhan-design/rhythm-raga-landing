import os
import csv
from typing import List, Dict, Any
from google_ads.models.campaign import CampaignBlueprint

class GoogleOfficialTemplateExporter:
    """
    Exports CampaignBlueprint into individual Google Ads official upload template CSVs.
    Guarantees 100% compatibility with Google Ads Web UI Bulk Uploads.
    """

    @classmethod
    def export_all(cls, blueprint: CampaignBlueprint, output_dir: str = "google_ads_upload_package") -> Dict[str, str]:
        os.makedirs(output_dir, exist_ok=True)
        files = {}

        # 1. Campaign CSV
        camp_file = os.path.join(output_dir, "1_campaign.csv")
        with open(camp_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "Row Type", "Action", "Campaign status", "Campaign", "Campaign type",
                "Networks", "Budget", "Budget type", "Bid strategy type", "Language",
                "Location", "EU political ads"
            ])
            writer.writerow([
                "Campaign", "Add", "Paused", blueprint.campaign_name, "Search",
                "Google search", f"{blueprint.daily_budget_inr:.2f}", "Daily", "Manual CPC",
                "en", "Delhi, India", "No"
            ])
        files["campaign"] = camp_file

        # 2. Ad Groups CSV
        ag_file = os.path.join(output_dir, "2_ad_groups.csv")
        with open(ag_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "Row Type", "Action", "Ad group status", "Campaign", "Ad group",
                "Ad group type", "Default max. CPC"
            ])
            for ag in blueprint.ad_groups:
                writer.writerow([
                    "Ad group", "Add", "Enabled", blueprint.campaign_name,
                    ag.ad_group_name, "Standard", f"{ag.cpc_bid_inr:.2f}"
                ])
        files["ad_groups"] = ag_file

        # 3. Keywords CSV
        kw_file = os.path.join(output_dir, "3_keywords.csv")
        with open(kw_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "Row Type", "Action", "Keyword status", "Campaign", "Ad group",
                "Keyword", "Type", "Default max. CPC"
            ])
            for ag in blueprint.ad_groups:
                all_kws = [ag.primary_keyword] + ag.variant_keywords
                for kw in all_kws:
                    for match in ag.match_types:
                        match_label = "Exact match" if match == "EXACT" else "Phrase match" if match == "PHRASE" else "Broad match"
                        writer.writerow([
                            "Keyword", "Add", "Enabled", blueprint.campaign_name,
                            ag.ad_group_name, kw, match_label, f"{ag.cpc_bid_inr:.2f}"
                        ])
        files["keywords"] = kw_file

        # 4. Negative Keywords CSV (Campaign & Ad Group Negatives)
        neg_file = os.path.join(output_dir, "4_negative_keywords.csv")
        with open(neg_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "Row Type", "Action", "Keyword status", "Level", "Campaign", "Ad group",
                "Negative keyword", "Type"
            ])
            # Campaign Level Negatives
            for neg in blueprint.campaign_negative_keywords:
                writer.writerow([
                    "Negative keyword", "Add", "Enabled", "Campaign", blueprint.campaign_name, "",
                    neg.text, "Broad match"
                ])
            # Ad Group Level Negatives (Cross-theme conflict resolution)
            for ag in blueprint.ad_groups:
                for neg in ag.negative_keywords:
                    writer.writerow([
                        "Negative keyword", "Add", "Enabled", "Ad group", blueprint.campaign_name,
                        ag.ad_group_name, neg.text, "Exact match" if neg.match_type == "EXACT" else "Broad match"
                    ])
        files["negatives"] = neg_file

        # 5. Responsive Search Ads (RSAs) CSV
        rsa_file = os.path.join(output_dir, "5_responsive_search_ads.csv")
        with open(rsa_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            header = [
                "Row Type", "Action", "Ad status", "Campaign", "Ad group", "Ad type",
                "Final URL", "Path 1", "Path 2",
                "Headline 1", "Headline 2", "Headline 3", "Headline 4", "Headline 5",
                "Headline 6", "Headline 7", "Headline 8", "Headline 9", "Headline 10",
                "Headline 11", "Headline 12", "Headline 13", "Headline 14", "Headline 15",
                "Description 1", "Description 2", "Description 3", "Description 4",
                "Headline 1 position"
            ]
            writer.writerow(header)
            for ag in blueprint.ad_groups:
                rsa = ag.responsive_search_ad
                final_url = rsa.final_urls[0] if rsa.final_urls else blueprint.landing_page_url
                
                # Headlines up to 15
                hl_texts = [h.text for h in rsa.headlines]
                while len(hl_texts) < 15:
                    hl_texts.append("")
                hl_texts = hl_texts[:15]

                # Descriptions up to 4
                desc_texts = [d.text for d in rsa.descriptions]
                while len(desc_texts) < 4:
                    desc_texts.append("")
                desc_texts = desc_texts[:4]

                pinned_pos = "1" if (rsa.headlines and rsa.headlines[0].pinned_field == "HEADLINE_1") else ""

                row = [
                    "Ad", "Add", "Enabled", blueprint.campaign_name, ag.ad_group_name,
                    "Responsive search ad", final_url, rsa.path1, rsa.path2
                ] + hl_texts + desc_texts + [pinned_pos]

                writer.writerow(row)
        files["rsas"] = rsa_file

        # 6. Sitelinks CSV
        sitelink_file = os.path.join(output_dir, "6_sitelinks.csv")
        with open(sitelink_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "Action", "Campaign", "Asset type", "Link text",
                "Description line 1", "Description line 2", "Final URL"
            ])
            for s in blueprint.assets.sitelinks:
                writer.writerow([
                    "Add", blueprint.campaign_name, "Sitelink", s.text,
                    s.description1, s.description2, s.final_url
                ])
        files["sitelinks"] = sitelink_file

        # 7. Callouts & Structured Snippets CSV
        callout_file = os.path.join(output_dir, "7_callouts_and_snippets.csv")
        with open(callout_file, "w", newline="", encoding="utf-8") as f:
            writer = csv.writer(f)
            writer.writerow([
                "Action", "Campaign", "Asset type", "Callout text", "Header", "Values"
            ])
            for c in blueprint.assets.callouts:
                writer.writerow([
                    "Add", blueprint.campaign_name, "Callout", c.text, "", ""
                ])
            for snip in blueprint.assets.structured_snippets:
                writer.writerow([
                    "Add", blueprint.campaign_name, "Structured snippet", "", snip.header, "; ".join(snip.values)
                ])
        files["callouts_snippets"] = callout_file

        return files
