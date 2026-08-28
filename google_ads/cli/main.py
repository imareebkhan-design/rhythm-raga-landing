#!/usr/bin/env python3
import sys
import os
import argparse
import json
import csv
from datetime import datetime

from google_ads.config import Config
from google_ads.auth.checker import AuthChecker
from google_ads.models.campaign import CampaignRequest, AuditRecord
from google_ads.keyword_research.planner import KeywordPlannerService
from google_ads.clustering.skag_clusterer import SKAGClusterer
from google_ads.negatives.negative_engine import NegativeKeywordEngine
from google_ads.campaign_builder.builder import CampaignBlueprintBuilder
from google_ads.validators.local_validator import LocalValidator
from google_ads.validators.landing_page import LandingPageValidator
from google_ads.validators.google_validator import GoogleValidator
from google_ads.idempotency.checker import IdempotencyChecker
from google_ads.launcher.executor import CampaignExecutor
from google_ads.reporting.verifier import PostLaunchVerifier
from google_ads.audit.audit_logger import AuditLogger

def main():
    parser = argparse.ArgumentParser(
        description="Production-Ready AI-Assisted Programmatic Google Ads Campaign Compiler & Executor"
    )
    parser.add_argument(
        "--check-auth",
        action="store_true",
        help="Validate environment variables, OAuth credentials, and customer account accessibility"
    )
    parser.add_argument(
        "--list-accounts",
        action="store_true",
        help="List all accessible Google Ads customer accounts for the authenticated OAuth user"
    )
    parser.add_argument(
        "--business",
        type=str,
        default="Rhythm Raga Academy",
        help="Business or brand name"
    )
    parser.add_argument(
        "--service", "--seed", "-s",
        type=str,
        default="Guitar Classes",
        help="Core service/product topic (e.g. 'Guitar Classes')"
    )
    parser.add_argument(
        "--location", "-l",
        type=str,
        default="GTB Nagar, Delhi",
        help="Target geographic location (e.g. 'GTB Nagar, Delhi')"
    )
    parser.add_argument(
        "--budget", "-b",
        type=float,
        default=500.0,
        help="Daily budget in INR (default: ₹500/day)"
    )
    parser.add_argument(
        "--objective", "-o",
        type=str,
        default="lead_generation",
        help="Campaign objective (default: lead_generation)"
    )
    parser.add_argument(
        "--url", "-u",
        type=str,
        default="https://rhythmraga.in",
        help="Target Landing Page URL (default: https://rhythmraga.in)"
    )
    parser.add_argument(
        "--language",
        type=str,
        default="English",
        help="Target language (default: English)"
    )
    parser.add_argument(
        "--bidding-strategy",
        type=str,
        default="MANUAL_CPC",
        help="Bidding strategy (MANUAL_CPC, MAXIMIZE_CLICKS, MAXIMIZE_CONVERSIONS, TARGET_CPA)"
    )
    parser.add_argument(
        "--max-skags", "-m",
        type=int,
        default=5,
        help="Maximum SKAG ad groups to build (default: 5)"
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Run campaign compiler in safe simulation / preview mode without live mutation"
    )
    parser.add_argument(
        "--execute", "--live",
        action="store_true",
        help="Execute live mutation on Google Ads API (requires explicit human approval prompt)"
    )
    parser.add_argument(
        "--validate-only",
        action="store_true",
        help="Run Google Ads API server-side payload validation"
    )
    parser.add_argument(
        "--export-json",
        type=str,
        default="",
        help="Path to export raw Campaign Blueprint JSON"
    )
    parser.add_argument(
        "--export-csv",
        type=str,
        default="",
        help="Path to export keyword research CSV table"
    )
    parser.add_argument(
        "--verbose", "-v",
        action="store_true",
        help="Print detailed diagnostic output"
    )

    args = parser.parse_args()

    # Handle --check-auth
    if args.check_auth:
        res = AuthChecker.check_auth()
        sys.exit(0 if res.get("status") == "READY" else 1)

    # Handle --list-accounts
    if args.list_accounts:
        res = AuthChecker.list_accounts()
        sys.exit(0 if res.get("status") == "SUCCESS" else 1)

    print("=" * 85)
    print("🚀 PROGRAMMATIC GOOGLE ADS CAMPAIGN COMPILER & EXECUTOR")
    print("=" * 85)
    print(f"🏢 Business / Academy  : {args.business}")
    print(f"🎸 Service / Offer     : {args.service}")
    print(f"📍 Location Targeting  : {args.location}")
    print(f"💰 Daily Budget        : ₹{args.budget:,.2f}/day")
    print(f"🎯 Campaign Objective  : {args.objective.upper()}")
    print(f"🔗 Landing Page URL    : {args.url}")
    print(f"🌐 Bidding Strategy    : {args.bidding_strategy.upper()}")
    print(f"📌 API Version         : {Config.API_VERSION}")
    print(f"🛡️ Mode               : {'🔴 LIVE CREATION' if args.execute else '🟢 DRY-RUN / PREVIEW MODE'}")
    print("=" * 85)

    # Construct request model
    req = CampaignRequest(
        business=args.business,
        service=args.service,
        location=args.location,
        budget=args.budget,
        objective=args.objective,
        landing_page_url=args.url,
        language=args.language,
        bidding_strategy=args.bidding_strategy,
        max_skags=args.max_skags
    )

    # 1. KEYWORD RESEARCH
    print("\n🔍 STEP 1: Conducting Google Ads Keyword Planner Research...")
    raw_ideas = KeywordPlannerService.fetch_keyword_ideas(
        seed_keywords=[args.service, f"{args.service} {args.location}"],
        page_url=args.url,
        target_service=args.service,
        target_location=args.location
    )

    # Filter by minimum score
    qualified_ideas = [i for i in raw_ideas if i.score.overall_score >= Config.MIN_KEYWORD_SCORE]
    ideas_map = {i.keyword.lower(): i for i in qualified_ideas}

    print(f"✅ Discovered & qualified {len(qualified_ideas)} search terms. Top Candidates Table:\n")
    print(f"{'#':<3} | {'KEYWORD':<34} | {'INTENT':<22} | {'VOL':<6} | {'SCORE':<5} | {'EST CPC (₹)':<12}")
    print("-" * 92)

    for idx, item in enumerate(qualified_ideas[:10], start=1):
        kw_text = item.keyword[:34]
        intent_name = item.score.intent_category.value[:22]
        vol = item.metrics.avg_monthly_searches
        score = item.score.overall_score
        cpc_range = f"₹{item.metrics.low_top_of_page_bid_cpc:.1f}–₹{item.metrics.high_top_of_page_bid_cpc:.1f}"
        print(f"{idx:<3} | {kw_text:<34} | {intent_name:<22} | {vol:<6} | {score:<5.1f} | {cpc_range:<12}")

    # Export CSV if requested
    if args.export_csv:
        try:
            with open(args.export_csv, "w", newline="", encoding="utf-8") as f:
                writer = csv.writer(f)
                writer.writerow(["Keyword", "Intent", "Monthly Volume", "Competition", "Low CPC", "High CPC", "Overall Score", "Rationale"])
                for item in qualified_ideas:
                    writer.writerow([
                        item.keyword, item.score.intent_category.value, item.metrics.avg_monthly_searches,
                        item.metrics.competition, item.metrics.low_top_of_page_bid_cpc, item.metrics.high_top_of_page_bid_cpc,
                        item.score.overall_score, item.score.rationale
                    ])
            print(f"📁 Exported keyword table CSV to '{args.export_csv}'")
        except Exception as e:
            print(f"⚠️ Failed to export CSV: {e}")

    # 2. THEME CLUSTERING
    print("\n🏗️ STEP 2: Building Tightly-Themed SKAG Ad Groups...")
    clusters = SKAGClusterer.create_clusters(
        qualified_ideas=qualified_ideas,
        landing_page_url=args.url,
        max_skags=args.max_skags
    )
    print(f"✅ Formed {len(clusters)} tightly-themed ad group architectures.")

    # 3. NEGATIVE KEYWORD ENGINE
    print("\n🛡️ STEP 3: Generating Campaign Negatives & Conflict Prevention...")
    campaign_negatives = NegativeKeywordEngine.generate_campaign_negatives(
        business=args.business,
        service=args.service
    )
    ad_group_negatives = NegativeKeywordEngine.resolve_cross_theme_conflicts(clusters)
    print(f"✅ Generated {len(campaign_negatives)} campaign-level negatives and cross-theme conflict rules.")

    # 4. CAMPAIGN BLUEPRINT ASSEMBLY
    print("\n📝 STEP 4: Compiling Campaign Blueprint Object...")
    blueprint = CampaignBlueprintBuilder.build(
        request=req,
        clusters=clusters,
        campaign_negatives=campaign_negatives,
        ad_group_negatives=ad_group_negatives,
        qualified_ideas_map=ideas_map
    )

    # 5. VALIDATIONS & PRE-FLIGHT CHECKS
    print("\n🧪 STEP 5: Running Local Asset & Landing Page Pre-Flight Verification...")
    local_val = LocalValidator.validate(blueprint)
    lp_ok, lp_warns = LandingPageValidator.validate_url(blueprint.landing_page_url, service=args.service, location=args.location)

    print(f"  • Local Asset Checks  : {'✅ PASSED' if local_val.is_valid else '❌ FAILED'}")
    print(f"  • Landing Page Checks : {'✅ REACHABLE' if lp_ok else '❌ UNREACHABLE'}")

    if local_val.local_warnings or lp_warns:
        print("  ⚠️ Warnings/Notices:")
        for w in local_val.local_warnings + lp_warns:
            print(f"     - {w}")

    # 6. IDEMPOTENCY CHECK
    exists, decision, existing_data = IdempotencyChecker.check_campaign_exists(blueprint.campaign_name)
    if exists:
        print(f"\n⚠️ Idempotency Notice: Campaign '{blueprint.campaign_name}' already exists in Google Ads (ID {existing_data.get('id')}). Decision: {decision}.")

    # 7. DISPLAY PREVIEW & RSAs
    print("\n" + "=" * 85)
    print("📋 CAMPAIGN BLUEPRINT PREVIEW & APPROVAL SUMMARY")
    print("=" * 85)
    print(f"Campaign Name : {blueprint.campaign_name}")
    print(f"Daily Budget  : ₹{blueprint.daily_budget_inr}/day ({blueprint.daily_budget_micros} micros)")
    print(f"Geo Target ID : {blueprint.geo_target_id} ({blueprint.location_name})")
    print(f"Language      : {blueprint.language_name} (ID {blueprint.language_id})")
    print(f"Ad Groups     : {len(blueprint.ad_groups)}")
    print(f"Negatives     : {len(blueprint.campaign_negative_keywords)}")

    if blueprint.ad_groups:
        sample_ag = blueprint.ad_groups[0]
        rsa = sample_ag.responsive_search_ad
        print(f"\n✨ Sample RSA Preview (Ad Group: {sample_ag.ad_group_name}):")
        print(f"   Target Keyword : [{sample_ag.primary_keyword}] / \"{sample_ag.primary_keyword}\"")
        print(f"   Display Path   : rhythmraga.in/{rsa.path1}/{rsa.path2}")
        print("   Headlines:")
        for h in rsa.headlines[:5]:
            pin_lbl = f" [{h.pinned_field}]" if h.pinned_field else ""
            print(f"     • {h.text}{pin_lbl}")
        print("   Descriptions:")
        for d in rsa.descriptions[:2]:
            print(f"     • {d.text}")

    # Export JSON if requested
    if args.export_json:
        try:
            with open(args.export_json, "w", encoding="utf-8") as f:
                json.dump(blueprint.to_dict(), f, indent=2)
            print(f"\n📁 Exported Campaign Blueprint JSON to '{args.export_json}'")
        except Exception as e:
            print(f"⚠️ Failed to export JSON: {e}")

    # Validate-Only API mode check if requested
    if args.validate_only:
        print("\n⚡ Running Google Ads API validate_only simulation request...")
        g_val_ok, g_val_msgs = GoogleValidator.validate_with_google(blueprint)
        for msg in g_val_msgs:
            print(f"   {msg}")

    # 8. HUMAN APPROVAL GATE
    approval_result = "APPROVED"
    if args.execute:
        print("\n" + "🛑" * 40)
        print("CRITICAL HUMAN APPROVAL GATE: LIVE GOOGLE ADS API MUTATION REQUESTED")
        print("🛑" * 40)
        confirm = input(f"Are you sure you want to launch campaign '{blueprint.campaign_name}' with budget ₹{blueprint.daily_budget_inr}/day on live Google Ads API? [y/N]: ").strip().lower()
        if confirm != "y":
            print("\n❌ Live campaign launch rejected by user. Aborting live execution.")
            approval_result = "REJECTED"
            launch_result = CampaignExecutor.run(blueprint, dry_run=True)
            launch_result.status = "REJECTED_BY_USER"
            launch_result.mode = "ABORTED_BY_USER"
            # Audit log
            audit_rec = AuditRecord(
                timestamp=datetime.utcnow().isoformat(),
                user_input=req.to_dict(),
                keyword_research_params={"seed": args.service, "url": args.url},
                keywords_returned_count=len(raw_ideas),
                keywords_selected_count=len(qualified_ideas),
                negative_keywords_count=len(campaign_negatives),
                campaign_blueprint=blueprint.to_dict(),
                validation_result=local_val.to_dict(),
                approval_result="REJECTED",
                launch_result=launch_result.to_dict()
            )
            AuditLogger.log(audit_rec)
            return

    # 9. EXECUTE LAUNCH
    print("\n⚡ STEP 9: Executing Campaign Launcher...")
    dry_run_mode = not args.execute
    launch_result = CampaignExecutor.run(blueprint, dry_run=dry_run_mode)

    # 10. POST-LAUNCH VERIFICATION
    print("\n🔎 STEP 10: Running Post-Launch Verification...")
    verification_report = PostLaunchVerifier.verify(launch_result, blueprint)

    # 11. AUDIT LOGGING
    audit_rec = AuditRecord(
        timestamp=datetime.utcnow().isoformat(),
        user_input=req.to_dict(),
        keyword_research_params={"seed": args.service, "url": args.url},
        keywords_returned_count=len(raw_ideas),
        keywords_selected_count=len(qualified_ideas),
        negative_keywords_count=len(campaign_negatives),
        campaign_blueprint=blueprint.to_dict(),
        validation_result=local_val.to_dict(),
        approval_result=approval_result,
        launch_result=launch_result.to_dict()
    )
    audit_path = AuditLogger.log(audit_rec)

    # 12. FINAL STATUS REPORT
    print("\n" + "=" * 85)
    print("📊 LAUNCHER FINAL STATUS REPORT")
    print("=" * 85)
    print(f"Launch Status       : {launch_result.status}")
    print(f"Execution Mode      : {launch_result.mode}")
    print(f"Campaign Name       : {blueprint.campaign_name}")
    print(f"SKAG Ad Groups      : {len(blueprint.ad_groups)}")
    print(f"Post-Launch Status  : {verification_report.get('verification_status')}")
    if audit_path:
        print(f"Audit Trail Saved   : {audit_path}")

    if launch_result.execution_steps:
        print("\nExecution Pipeline Steps:")
        for step in launch_result.execution_steps:
            print(f"  [Step {step['step']}] {step['operation']} => {step['status']}: {step['details']}")

    print("\n✨ Process completed successfully!")

if __name__ == "__main__":
    main()
