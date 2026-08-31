# Google Ads v2 Package — RR_SEARCH_GTB_NAGAR_CORE

Replacement for the paused `SEARCH_SKAG_MUSIC_CLASSES_GTB_NAGAR__DELHI` and
`LOCAL_CALLS_GMB_GTB_NAGAR_5KM` campaigns. One campaign, not two.

## Upload order (Google Ads Editor)

1. `1_campaign.csv`
2. `2_ad_groups.csv`
3. `3_keywords.csv`
4. `4_negative_keywords.csv`
5. `5_responsive_search_ads.csv`
6. `6_assets.csv`

## What changed from v1, and why

| Change | v1 | v2 | Reason |
|---|---|---|---|
| Campaigns | 2 (search + call) | 1 | ₹4,452 split two ways produced no learnable signal in either |
| Max CPC | ₹82.00 bid / ₹52.89 actual | ₹24.00 | ₹52.89 implies CAC ₹5,509 — breaches the ₹4,000 ceiling in the financial model |
| Daily budget | ₹1,000 | ₹400 | v1 spent only ₹581.79 total; budget was never the constraint, inventory was |
| Radius | 5 km | 7 km | 5 km + exact match starved the campaign of impressions |
| Structure | 5 SKAG ad groups | 4 themed ad groups | SKAG fragments already-thin volume; nothing reaches significance |
| Match types | Exact + Phrase | Phrase + Exact | unchanged, but consolidated into fewer ad groups |
| `book` negative | present (campaign, broad) | **removed** | blocked "book music class near me" — the highest-intent query set |
| Final URLs | `rhythmraga.in` (dead) | `https://www.rhytthmraga.com/...` | v1 URL had no DNS record; this caused the disapproval |
| Phone number | in description text | call asset only | raw numbers in ad text violate Google editorial policy |
| State exclusions | 44 rows | dropped | redundant under "Location of presence" with a 7 km radius |

## Before you enable

Conversion tracking gates everything below. See the evaluation report.

- [ ] Create a **Calls from ads** conversion action (v1 had none — the call
      campaign could not have recorded a conversion even if it got one)
- [ ] Mark the booking conversion **Primary**, phone/WhatsApp clicks **Secondary**
- [ ] Confirm `AW-18326020860` fires on `/book` completion (tag is live; the
      event fires on booking success in `src/routes/book.slot.tsx`)

## Bid ceiling math

Max CPC is derived, not guessed:

```
max CPC = max CAC × (lead→paid rate) × (landing page CVR)
        = ₹4,000 × 0.12 × 0.05
        = ₹24.00
```

Raise the ceiling only when measured landing-page CVR justifies it:

| Landing page CVR | Max CPC at ₹4,000 CAC |
|---|---|
| 3% | ₹14.40 |
| 5% | ₹24.00 |
| 8% | ₹38.40 |
| 10% | ₹48.00 |
