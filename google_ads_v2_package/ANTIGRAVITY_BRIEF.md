# Work Order — RhythmRaga Google Ads Remediation

**Paste this whole file as the task prompt.**

## Context

Account: RhythmRaga Academy, a physical music school in GTB Nagar, North Delhi.
Google Ads customer ID: `4607004100` (460-700-4100). Currency INR.

Two campaigns are paused after ad disapprovals:

| Campaign | ID | Spend | Clicks | Conversions |
|---|---|---|---|---|
| `SEARCH_SKAG_MUSIC_CLASSES_GTB_NAGAR__DELHI` | 24193850110 | ₹581.79 | 11 | 0 |
| `LOCAL_CALLS_GMB_GTB_NAGAR_5KM` | 24105443029 | ₹3,870.65 | **unknown** | 0 |

Canonical landing page: `https://www.rhytthmraga.com/` (verified live).
Dead domain that caused the disapprovals: `rhythmraga.in` (no DNS record).
Google Ads conversion tag `AW-18326020860` is live on `/` and `/book`, and fires
on **web booking completion only**.

Business constraint from the academy's financial model, which bounds every
bidding decision below:

- Contribution per student: **₹2,000/month**
- Maximum defensible CAC: **₹4,000**
- Assumed lead-to-paid rate: **12%**
- Therefore `max CPC = ₹4,000 × 0.12 × landing-page CVR`
  → **₹24.00 at a 5% CVR**, ₹38.40 at 8%. Never bid above ₹38.40.

## Rules of engagement

1. **Phase 0 is read-only.** Change nothing in the account until Phase 0 output
   has been reported back and approved.
2. Before **any** mutation, print the exact change (entity, resource name,
   before value, after value) and wait for explicit approval.
3. After each mutation, re-query the entity and show the resulting state.
4. Never raise a bid above ₹38.40 without being told to.
5. Never unpause a campaign until Phase 1 is complete and verified.
6. If a step's precondition is not met, stop and report — do not improvise.

---

## Phase 0 — Diagnostics (READ ONLY)

Run all six queries. Report results as tables. Do not modify anything.

### 0.1 The missing numbers — campaign 2's real traffic

This is the single most important gap. Without click count, campaign 2's zero
conversions cannot be interpreted.

```sql
SELECT
  campaign.id, campaign.name, campaign.status,
  campaign.advertising_channel_type, campaign.bidding_strategy_type,
  campaign_budget.amount_micros,
  metrics.impressions, metrics.clicks, metrics.ctr,
  metrics.cost_micros, metrics.average_cpc,
  metrics.conversions, metrics.all_conversions,
  metrics.phone_calls, metrics.phone_impressions,
  metrics.search_impression_share,
  metrics.search_budget_lost_impression_share,
  metrics.search_rank_lost_impression_share
FROM campaign
WHERE campaign.id IN (24193850110, 24105443029)
  AND segments.date DURING LAST_90_DAYS
```

**Report explicitly:** clicks and average CPC for campaign 24105443029, and
lost impression share split by budget vs rank for both.

### 0.2 Does a call conversion action exist?

```sql
SELECT
  conversion_action.id, conversion_action.name, conversion_action.type,
  conversion_action.category, conversion_action.status,
  conversion_action.primary_for_goal, conversion_action.counting_type,
  conversion_action.phone_call_duration_seconds
FROM conversion_action
```

**Report explicitly:** whether any action has type
`AD_CALL_CONVERSION` or `CLICK_TO_CALL`, and which actions are
`primary_for_goal = TRUE`.

### 0.3 Exact disapproval reasons, from the source

```sql
SELECT
  campaign.name, ad_group.name, ad_group_ad.ad.id,
  ad_group_ad.policy_summary.approval_status,
  ad_group_ad.policy_summary.policy_topic_entries,
  ad_group_ad.ad.final_urls
FROM ad_group_ad
WHERE ad_group_ad.policy_summary.approval_status != 'APPROVED'
```

### 0.4 Every negative keyword currently on the account

```sql
SELECT
  campaign.name, campaign_criterion.criterion_id,
  campaign_criterion.keyword.text, campaign_criterion.keyword.match_type
FROM campaign_criterion
WHERE campaign_criterion.type = 'KEYWORD'
  AND campaign_criterion.negative = TRUE
```

**Report explicitly:** whether a negative with text `book` exists at campaign
level, and its match type. This one blocks "book music classes near me" — the
highest-intent query set on the account — and must be flagged loudly if present.

### 0.5 Where the money actually went

```sql
SELECT
  search_term_view.search_term, campaign.name, ad_group.name,
  metrics.clicks, metrics.cost_micros, metrics.conversions
FROM search_term_view
WHERE segments.date DURING LAST_90_DAYS
ORDER BY metrics.cost_micros DESC
LIMIT 100
```

### 0.6 Keyword quality and cost

```sql
SELECT
  campaign.name, ad_group.name,
  ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type,
  ad_group_criterion.quality_info.quality_score,
  ad_group_criterion.effective_cpc_bid_micros,
  metrics.clicks, metrics.cost_micros, metrics.average_cpc, metrics.conversions
FROM keyword_view
WHERE segments.date DURING LAST_90_DAYS
ORDER BY metrics.cost_micros DESC
```

### Phase 0 deliverable

A written answer to these four questions, then **stop**:

1. How many clicks did campaign 24105443029 buy, and at what average CPC?
2. Given that click count, is its zero-conversion result statistically
   meaningful, or was it never measurable because no call conversion action
   existed? Show the binomial reasoning.
3. What was lost impression share due to **rank** on campaign 24193850110? If
   rank-lost IS was already high at a ₹82 bid, a ₹24 bid may win almost no
   traffic — say so plainly.
4. Does the `book` negative exist on the account?

---

## Phase 1 — Conversion tracking (BLOCKING GATE)

Nothing else may proceed until this is done and verified.

**1.1** Create a **Calls from ads** conversion action:
- Name: `Phone Call from Ad`
- Type: click-to-call / call from ads
- Count: **one** per click (a lead, not a sale)
- Minimum call duration: **60 seconds**
- Category: `PHONE_CALL_LEAD`
- Attribution window: 30 days
- Primary for goal: **TRUE**

**1.2** Review conversion action priorities so that:
- Booking completion (web) → **Primary**
- `Phone Call from Ad` → **Primary**
- Any page-view or click micro-conversion → **Secondary**

**1.3** Verify the web tag end to end. Submit a real test booking at
`https://www.rhytthmraga.com/book` and confirm a conversion registers against
`AW-18326020860`. Report the conversion action name and timestamp it landed
under. If it does not register within 3 hours, stop and report — the rest of
the plan is worthless without it.

**Gate:** do not continue until 1.1–1.3 are all confirmed.

---

## Phase 2 — Build the replacement campaign

Source files are in `google_ads_v2_package/` in the repository
(`imareebkhan-design/rhythm-raga-landing`, branch
`claude/google-ads-skill-install-mmqcis`). Build via API or upload the CSVs —
either is fine, but the resulting account state must match this spec:

| Setting | Value |
|---|---|
| Campaign name | `RR_SEARCH_GTB_NAGAR_CORE` |
| Type | Search only, no search partners, no Display expansion |
| Status | **Paused** on creation |
| Daily budget | ₹400.00 |
| Bidding | Manual CPC, enhanced CPC **off** |
| Max CPC | ₹24.00 on every ad group and keyword |
| Location | 7 km radius around 28.6977, 77.2069 |
| Location option | **Presence only** — never "presence or interest" |
| Language | English |
| Ad groups | `AG_Guitar`, `AG_Piano_Keyboard`, `AG_Vocals_Singing`, `AG_Music_Classes_Generic` |
| Keywords | 46 total, phrase + exact only. No broad match. |
| Final URLs | `https://www.rhytthmraga.com/book?course=…` only |
| Call asset | `+918796574448`, campaign level, India |

Hard requirements:

- The negative `book` must **not** exist anywhere on this campaign.
- No phone number in any headline or description — call asset only.
- No state-level location exclusions (redundant under presence-only).
- Every final URL must return HTTP 200 before the campaign is enabled. Check
  each one and report the status codes.

---

## Phase 3 — Pre-launch verification

Re-query the built campaign and confirm each line. Report as a pass/fail table.

- [ ] Campaign status paused, budget ₹400.00/day
- [ ] Bidding is Manual CPC, eCPC disabled
- [ ] No keyword or ad group bid exceeds ₹24.00
- [ ] Geo target is presence-only, 7 km radius, correct coordinates
- [ ] Search partners off, Display expansion off
- [ ] 4 ad groups, 46 keywords, zero broad-match keywords
- [ ] `book` is not a negative on this campaign
- [ ] All 4 RSAs approved (`policy_summary.approval_status = APPROVED`)
- [ ] Call asset attached at campaign level
- [ ] Two primary conversion actions active: web booking + phone call

Only after every line passes: enable the campaign and report the timestamp.

---

## Phase 4 — Measurement rules

Do not optimise before the data can support it.

- **Do not judge performance below 40 clicks.** At an 8% conversion rate there
  is a 40% chance of seeing zero conversions in 11 clicks. The previous
  campaign was paused on exactly that noise.
- At 40 clicks, report: clicks, cost, average CPC, conversions, cost per
  conversion, search impression share, and rank-lost impression share.
- **Decision rule at 40 clicks:**
  - Cost per conversion under ₹4,000 → hold, keep accumulating.
  - Impression share under 10% with high rank-lost IS → the market price
    exceeds what this business can pay. Report that conclusion directly; do
    **not** raise bids to fix it.
  - Zero conversions with good impression share → the constraint is the
    landing page, not the ads. Report that.
- Weekly: pull the search terms report and propose negatives. Never add a
  negative that could block a booking-intent query.

---

## What NOT to do

- Do not enable Performance Max, Display, or broad match.
- Do not switch to Maximize Conversions before 15–30 conversions exist.
- Do not raise the budget above ₹400/day without a measured CAC under ₹4,000.
- Do not re-add the state-exclusion list.
- Do not point any URL at `rhythmraga.in` or `rhythmraga.com` (single-t —
  that is a different site).
