# Work Order 02 — Act on the August Audit

**Supersedes the Phase 2/3 launch instructions in `ANTIGRAVITY_BRIEF.md`.**
Paste this whole file as the task prompt.

## Context

Account `4607004100` (Rhythm Raga Academy, GTB Nagar, North Delhi). August 2026
delivered 1,484 clicks, ₹13,616.46 spend, 13 conversions. Those figures are
correct and are not in dispute. What follows corrects how they were interpreted
and what should happen next.

### Correction 1 — cost per lead is not cost per student

The August report compared a **cost per lead** of ₹1,047.42 against a **maximum
cost per acquired student** of ₹4,000 and concluded the account was performing
inside its ceiling. Those are different units, separated by the lead-to-paid
rate (12% in the academy's financial model).

| Campaign | Spend | Conv | CPL | Implied CAC at 12% | Status |
|---|---|---|---|---|---|
| Vocals | ₹4,621.68 | 12 | ₹385.14 | ₹3,209 | Within ceiling |
| Instruments | ₹4,542.34 | 1 | ₹4,542.34 | ₹37,853 | Severe breach |
| **Blended** | ₹13,616.46 | 13 | ₹1,047.42 | **₹8,728** | **2.2× over ceiling** |

**Maximum acceptable CPL is ₹480**, not ₹4,000 (`₹4,000 × 0.12`).

From now on, every report must state implied CAC alongside CPL, computed as
`CAC = CPL ÷ lead-to-paid rate`. Never compare a CPL to the CAC ceiling.

### Correction 2 — do not enable the V2 campaign

`RR_SEARCH_GTB_NAGAR_CORE` contains `AG_Vocals_Singing`, `AG_Guitar` and
`AG_Piano_Keyboard`. Those duplicate the keywords, geography and account of the
already-live `RR_Search_Vocals_Hyperlocal_5KM` and
`RR_Search_Instruments_Hyperlocal_5KM`. Enabling it creates self-competition:
the account bids against itself, conversion data splits three ways, and CPCs
rise. V2 was designed on the assumption that those campaigns did not exist.

**Leave V2 paused. Do not enable it. Harvest its fixes into the live campaigns
instead.**

## Rules of engagement

1. Phase 0 is read-only. Report before changing anything.
2. Before any mutation, print entity, resource name, before value, after value,
   and wait for explicit approval.
3. After each mutation, re-query the entity and show the resulting state.
4. Never bid above ₹38.40.
5. If a precondition is not met, stop and report — do not improvise.
6. Report every figure with the date range and campaign it came from.

---

## Phase 0 — Read-only

### 0.1 Itemise the 13 conversions

The decisive business question is how many of those bookings became paying
students. That answer lives in the academy's admissions register, not the API —
so produce the list the owner needs to match against it.

```sql
SELECT
  campaign.name, ad_group.name, segments.date,
  segments.conversion_action_name, segments.conversion_action_category,
  metrics.conversions, metrics.all_conversions
FROM ad_group
WHERE segments.date BETWEEN '2026-08-01' AND '2026-08-31'
  AND metrics.conversions > 0
ORDER BY segments.date
```

Report as a dated list: which campaign, which ad group, which conversion action.

**Then state this threshold explicitly in your output:**

- Blended, **26.2%** of the 13 bookings must enrol for the account to hold a
  ₹4,000 CAC (3.40 students from 13 bookings).
- Vocals alone needs only **9.6%** (1.16 students from 12 bookings).

### 0.2 Real Quality Score data

The August report's "Quality Score" section quoted a 5.0% CTR. That is not a
Quality Score. Return the actual 1–10 scores and their three components.

```sql
SELECT
  campaign.name, ad_group.name,
  ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type,
  ad_group_criterion.quality_info.quality_score,
  ad_group_criterion.quality_info.creative_quality_score,
  ad_group_criterion.quality_info.post_click_quality_score,
  ad_group_criterion.quality_info.search_predicted_ctr,
  metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions
FROM keyword_view
WHERE segments.date BETWEEN '2026-08-01' AND '2026-08-31'
  AND metrics.impressions > 0
ORDER BY metrics.cost_micros DESC
```

If a keyword returns no quality score, say so rather than substituting a proxy.

### 0.3 Impression share headroom

```sql
SELECT
  campaign.name, campaign.status,
  metrics.impressions, metrics.clicks, metrics.cost_micros,
  metrics.search_impression_share,
  metrics.search_budget_lost_impression_share,
  metrics.search_rank_lost_impression_share,
  metrics.conversions
FROM campaign
WHERE segments.date BETWEEN '2026-08-01' AND '2026-08-31'
```

Report the budget/rank split per campaign. Budget-lost share is recoverable by
spending more; rank-lost share is not, and tells us whether scaling is possible
at all.

### 0.4 Instruments campaign — is it fixable or structurally unaffordable?

```sql
SELECT
  ad_group.name, ad_group_criterion.keyword.text,
  ad_group_criterion.keyword.match_type,
  ad_group_criterion.effective_cpc_bid_micros,
  metrics.impressions, metrics.clicks, metrics.average_cpc,
  metrics.cost_micros, metrics.conversions
FROM keyword_view
WHERE campaign.id = 24151232153
  AND segments.date BETWEEN '2026-08-01' AND '2026-08-31'
ORDER BY metrics.cost_micros DESC
```

Identify which keywords consumed the ₹4,542 for 1 conversion.

### 0.5 Keyword overlap between V2 and the live campaigns

```sql
SELECT
  campaign.name, campaign.status, ad_group.name,
  ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type
FROM keyword_view
WHERE campaign.status IN ('ENABLED','PAUSED')
```

Report every keyword text appearing in more than one campaign. This quantifies
the self-competition risk described in Correction 2.

### Phase 0 deliverable

Answer these, then **stop**:

1. The dated list of 13 conversions, by campaign and ad group.
2. Actual quality scores — how many keywords score below 5?
3. Per campaign: how much impression share was lost to budget vs rank?
4. Which instruments keywords burned the ₹4,542?
5. Which keywords overlap between V2 and the live campaigns?

---

## Phase 1 — Stop the bleeding on Instruments

Only after Phase 0 is reported.

`RR_Search_Instruments_Hyperlocal_5KM` (ID `24151232153`) is running at ₹20.74
average CPC for 1 conversion. Its implied CAC is ₹37,853.

**Preferred action:** cap max CPC at **₹24.00**, and pause every keyword that
spent more than ₹500 in August with zero conversions. Do not pause the whole
campaign yet — 1 conversion on 219 clicks is not statistically conclusive
(roughly a 17% chance under the vocals conversion rate), so cut cost rather than
cutting the campaign.

**If Phase 0.4 shows the spend concentrated in two or three expensive keywords,**
pause those specific keywords instead of applying a blanket cap, and say so.

Report projected monthly saving.

## Phase 2 — Scale Vocals, carefully

`RR_Search_Vocals_Hyperlocal_5KM` (ID `24156088252`) is the only campaign
clearing its ceiling: ₹385.14 per lead, ₹3,209 implied CAC, ~12% impression
share.

1. Raise its daily budget by **50%** — not more. Report the new figure before
   applying it.
2. Do **not** change its bidding strategy. It is on Maximize Conversions and it
   is working.
3. **Stop-loss:** if CPL exceeds **₹480** on a 7-day rolling basis, revert the
   budget to its previous level and report immediately. That is the point where
   implied CAC crosses ₹4,000.
4. Re-check after 14 days. Expect CPL to rise as impression share grows —
   buying a larger share of an auction means buying less-qualified impressions.
   Rising CPL is normal; crossing ₹480 is not.

## Phase 3 — Harvest V2, do not launch it

Keep `RR_SEARCH_GTB_NAGAR_CORE` **paused**. Port these into the live campaigns:

- The negative keyword list from `google_ads_v2_package/4_negative_keywords.csv`
  — but **verify `book` is not among them** before applying, and confirm no
  negative blocks a booking-intent query.
- Presence-only geo targeting on both live campaigns. August saw
  `piano lesson manila` and `yoga classes trichy` served, which indicates
  "presence or interest" targeting or over-broad matching. Confirm the current
  setting on each live campaign and report it.
- The verified final URLs on `https://www.rhytthmraga.com`.

## Phase 4 — Reconcile the repository with production

`public/llms.txt`, `public/llms-full.txt` and the `MusicSchool` / `LocalBusiness`
JSON-LD are **live on the deployed site** but exist in **neither branch** of
`imareebkhan-design/rhythm-raga-landing`. `main` is unchanged at `a924c2b`, and
the only other branch is `claude/google-ads-skill-install-mmqcis`.

The August report stated "Synced to Git Main Branch". That is not the case.

1. Commit the deployed SEO and schema work to a branch and open a pull request.
2. Do not force-push or rewrite history — this repository syncs with Lovable.
3. Until this is reconciled, a deploy from `main` may silently revert the work.

## Phase 5 — Verify booking slots are real

The August report states users are "always presented with active daytime slots
for the next 7 days". Confirm those slots reflect genuine instructor
availability. If the calendar shows fixed times regardless of real capacity,
prospects will book classes the academy cannot honour, which costs more than a
missed click. Report what the booking engine actually does before changing it.

## Reporting standard for all future reports

- State implied CAC next to every CPL: `CAC = CPL ÷ 0.12`.
- Never present CTR as Quality Score.
- Mark every figure as measured or estimated, and give its date range.
- When a claim is that code or config was deployed, cite the commit or the
  resource name that proves it.
- State sample size next to any conversion-rate claim.

## What NOT to do

- Do not enable `RR_SEARCH_GTB_NAGAR_CORE`.
- Do not enable Performance Max, Display, or broad match.
- Do not raise the Vocals budget more than 50% in one step.
- Do not change bidding strategy on a campaign that is converting.
- Do not add a negative keyword that could block a booking-intent query.
