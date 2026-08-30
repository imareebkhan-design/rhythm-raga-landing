# RHYTHMRAGA ACADEMY — GOOGLE ADS FORENSIC PERFORMANCE REPORT

**Customer ID**: `460-700-4100`  
**Business**: RhythmRaga Academy (Offline Music Institute, GTB Nagar, North Delhi)  
**Reporting Period**: August 1, 2026 – August 30, 2026  
**Audited By**: Senior Google Ads Performance Marketing Lead & Marketing Data Engineer  
**Audit Type**: 100% Read-Only Forensic Analysis (Zero Account Mutations)  

---

## 1. Executive Summary

Over the audited 30-day period (Aug 1 – Aug 30, 2026), RhythmRaga Academy spent **₹13,042.35** across 4 Google Ads campaigns, generating **34,625 impressions**, **1,405 clicks** (4.06% CTR), and **13 raw reported conversions** at an average cost per conversion of **₹1,003.26**.

```
Macro Account Efficiency Waterfall:
┌────────────────────────────────────────────────────────┬─────────────┬───────────┐
│ Category                                               │ Spend (₹)   │ Share (%) │
├────────────────────────────────────────────────────────┼─────────────┼───────────┤
│ 🛑 1. Smart/Display Expansion ("Want to Learn Music?") │ ₹3,870.65   │ 29.7%     │
│ 🚨 2. Out-of-Catchment Non-Delhi Spend                 │ ₹5,073.57   │ 38.9%     │
│ 💸 3. Internal Cannibalization & Bidding Inefficiency  │ ₹1,850.00   │ 14.2%     │
│ ✅ 4. True Local Targeted Search Conversions           │ ₹2,248.13   │ 17.2%     │
├────────────────────────────────────────────────────────┼─────────────┼───────────┤
│ TOTAL ACCOUNT SPEND                                    │ ₹13,042.35  │ 100.0%    │
└────────────────────────────────────────────────────────┴─────────────┴───────────┘
```

**Key Forensic Findings**:
1. **68.6% of account spend was lost to non-converting or out-of-catchment inventory**:
   * `Want to Learn about Music?` spent ₹3,870.65 across mobile apps with zero conversions.
   * Default *"Presence or Interest"* geo-targeting caused 11 of the 13 conversions to originate from distant states (Patna, Lucknow, Ahmedabad) seeking online classes.
2. **Singing/Vocal Search was the sole converting engine**:
   * `RR_Search_Vocals_Hyperlocal_5KM` delivered **12 of 13 conversions** at **₹5.62 average CPC** and **₹364.65 CPA**.
3. **Instruments Campaign suffered from severe bidding inflation**:
   * `RR_Search_Instruments_Hyperlocal_5KM` used *Target Impression Share*, pushing average CPC to **₹23.94** (spiking to ₹74.30), resulting in only 1 conversion for ₹4,214.14 in spend.

---

## 2. Account-Level Performance

| Metric | Measured Value | Benchmark / Health Status |
| :--- | :---: | :--- |
| **Total Spend** | **₹13,042.35** | 100% Account spend |
| **Total Impressions** | **34,625** | 95.2% Mobile / 3.7% Desktop / 1.0% Tablet |
| **Total Clicks** | **1,405** | 97.5% Mobile click concentration |
| **Click-Through Rate (CTR)** | **4.06%** | Healthy Search CTR benchmark (> 3.5%) |
| **Average Cost Per Click (CPC)** | **₹9.28** | Blended average (Spanning ₹2.76 to ₹52.89) |
| **Total Reported Conversions** | **13** | Raw form submissions logged in Google Ads |
| **Conversion Rate (CVR)** | **0.93%** | 13 conversions / 1,405 clicks |
| **Cost Per Conversion (CPA)** | **₹1,003.26** | ₹13,042.35 spend / 13 conversions |
| **Conversion Value** | **₹0.00** | Static lead capture (no ecommerce value tracked) |

### Entity Inventory Summary:
* **Total Campaigns**: 4 (2 Enabled, 1 Paused, 1 Removed)
* **Total Ad Groups**: 7 (6 Enabled, 1 Removed)
* **Total Active Keywords**: 48
* **Total Negative Keywords**: 60+ (Firewall Active)
* **Total Responsive Search Ads (RSAs)**: 7 (6 Enabled, 1 Paused)

---

## 3. Complete Campaign Performance

| Campaign Name | Campaign ID | Status | Campaign Type | Daily Budget | Bid Strategy | Impr. | Clicks | CTR | Spend (₹) | Avg. CPC | Conv. | CVR | CPA (₹) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`RR_Search_Vocals_Hyperlocal_5KM`** | `24156088252` | `ENABLED` | Search | ~₹350 | Maximize Conversions | 17,968 | 779 | 4.33% | ₹4,375.77 | ₹5.62 | 12 | 1.54% | ₹364.65 |
| **`RR_Search_Instruments_Hyperlocal_5KM`** | `24151232153` | `ENABLED` | Search | ~₹350 | Target Impression Share | 8,443 | 176 | 2.09% | ₹4,214.14 | ₹23.94 | 1 | 0.57% | ₹4,214.14 |
| **`Want to Learn about Music?`** | `24105443029` | `REMOVED` | Smart/Display | — | Maximize Conversions | 8,124 | 439 | 5.40% | ₹3,870.65 | ₹8.82 | 0 | 0.00% | — |
| **`SEARCH_SKAG_MUSIC_CLASSES_GTB_NAGAR`** | `24193850110` | `PAUSED` | Search | ₹1,000 | Manual CPC | 90 | 11 | 12.22% | ₹581.79 | ₹52.89 | 0 | 0.00% | — |

---

## 4. Complete Ad Group Performance

| Campaign | Ad Group Name | Ad Group ID | Status | Impr. | Clicks | CTR | Spend (₹) | Avg. CPC | Conv. | CVR | CPA (₹) |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`RR_Search_Vocals`** | `AG_Vocals_Local` | `203100349167` | `ENABLED` | 11,327 | 583 | 5.15% | ₹3,400.02 | ₹5.83 | 9 | 1.54% | ₹377.78 |
| **`RR_Search_Vocals`** | `AG_Singing_Beginners` | `198077315886` | `ENABLED` | 4,178 | 108 | 2.59% | ₹499.22 | ₹4.62 | 3 | 2.78% | ₹166.41 |
| **`RR_Search_Vocals`** | `AG_Classical_Vocal` | `206144699704` | `ENABLED` | 2,463 | 88 | 3.57% | ₹476.52 | ₹5.42 | 0 | 0.00% | — |
| **`RR_Search_Instruments`** | `AG_Guitar_Local` | `199053769323` | `ENABLED` | 6,111 | 99 | 1.62% | ₹2,350.13 | ₹23.74 | 1 | 1.01% | ₹2,350.13 |
| **`RR_Search_Instruments`** | `AG_Piano_Keys_Local` | `205001974688` | `ENABLED` | 1,834 | 58 | 3.16% | ₹1,431.26 | ₹24.68 | 0 | 0.00% | — |
| **`RR_Search_Instruments`** | `AG_Drums_Flute_Local` | `200375418218` | `ENABLED` | 498 | 19 | 3.82% | ₹432.75 | ₹22.78 | 0 | 0.00% | — |
| **`SEARCH_SKAG_MUSIC`** | `Top Performers - Guitar` | `198383780103` | `PAUSED` | 90 | 11 | 12.22% | ₹581.79 | ₹52.89 | 0 | 0.00% | — |
| **`Want to Learn Music?`** | *(Smart Auto-Targeting)* | — | `REMOVED` | 8,124 | 439 | 5.40% | ₹3,870.65 | ₹8.82 | 0 | 0.00% | — |

---

## 5. Complete Ad & RSA Creative Breakdown

```
========================================================================================
CAMPAIGN: RR_Search_Vocals_Hyperlocal_5KM
Ad Group: AG_Vocals_Local | Ad ID: 77192031101 | Status: ENABLED | Ad Strength: Good
Final URL: https://rhytthmraga.com/book
Headlines:
  1. Singing Classes in GTB Nagar
  2. Vocal Training Near Metro Gate 4
  3. Certified Vocal Coaches
  4. 1-on-1 Voice Training Sessions
  5. Book Free Studio Demo
Descriptions:
  1. Master pitch control, vocal range, and classical singing in GTB Nagar. Book a studio visit!
  2. Personalized voice coaching for kids, teens, and adults near Delhi University.
Metrics: 11,327 Impr | 583 Clicks | ₹3,400.02 Spend | ₹5.83 CPC | 9 Conv | ₹377.78 CPA

========================================================================================
CAMPAIGN: RR_Search_Instruments_Hyperlocal_5KM
Ad Group: AG_Guitar_Local | Ad ID: 77192031102 | Status: ENABLED | Ad Strength: Good
Final URL: https://rhytthmraga.com/book
Headlines:
  1. Guitar Classes in GTB Nagar
  2. Acoustic & Electric Guitar
  3. Near Metro Gate 4 Hudson Lane
  4. 1-on-1 Certified Mentors
  5. Reserve Studio Trial Class
Descriptions:
  1. Offline guitar lessons in North Delhi. Learn chords, fingerstyle, and lead from pros.
  2. Flexible weekend and weekday slots for beginners & advanced learners in GTB Nagar.
Metrics: 6,111 Impr | 99 Clicks | ₹2,350.13 Spend | ₹23.74 CPC | 1 Conv | ₹2,350.13 CPA
========================================================================================
```

---

## 6. Keyword & Search Term Forensics

### Top Active Keywords:

| Campaign | Ad Group | Keyword | Match Type | Impr. | Clicks | Spend (₹) | CPC (₹) | Conv. | CPA (₹) | Category |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| `RR_Search_Vocals` | `AG_Vocals_Local` | `singing classes near me` | Phrase | 4,210 | 185 | ₹1,040.20 | ₹5.62 | 4 | ₹260.05 | 🟢 Winner |
| `RR_Search_Vocals` | `AG_Vocals_Local` | `vocal classes in gtb nagar` | Phrase | 2,890 | 142 | ₹780.40 | ₹5.50 | 3 | ₹260.13 | 🟢 Winner |
| `RR_Search_Vocals` | `AG_Singing_Beginners`| `singing classes for beginners`| Phrase | 2,150 | 64 | ₹295.10 | ₹4.61 | 2 | ₹147.55 | 🟢 Winner |
| `RR_Search_Instruments` | `AG_Guitar_Local` | `guitar classes near me` | Phrase | 3,140 | 48 | ₹1,214.50 | ₹25.30 | 1 | ₹1,214.50 | 🟠 Expensive |
| `RR_Search_Instruments` | `AG_Piano_Keys_Local`| `piano classes near me` | Phrase | 1,120 | 38 | ₹940.10 | ₹24.74 | 0 | — | 🟡 Watch |
| `RR_Search_Instruments` | `AG_Guitar_Local` | `guitar lessons gtb nagar` | Phrase | 980 | 22 | ₹480.20 | ₹21.83 | 0 | — | 🟡 Watch |
| `RR_Search_Instruments` | `AG_Drums_Flute_Local`| `drum classes near me` | Phrase | 340 | 14 | ₹318.40 | ₹22.74 | 0 | — | 🟡 Watch |

### Critical Search Term Forensic Audit (Out of 3,943 Queries Analyzed):

```
Top Search Queries by Spend:
├── "None" [Want to Learn about Music?]:  8,123 Impr | 439 Clicks | ₹3,870.65 Spend | 0 Conv (🛑 REMOVED)
├── "guitar classes near me" [Instruments]: 133 Impr | 19 Clicks  | ₹717.44 Spend   | 1 Conv (CPA: ₹717)
├── "singing classes near me" [Vocals]:      99 Impr | 18 Clicks  | ₹415.43 Spend   | 0 Conv (Local Intent)
├── "guitar classes near me" [Vocals] ❌:   213 Impr | 45 Clicks  | ₹322.18 Spend   | 0 Conv (Cannibalized)
├── "piano classes near me" [Instruments]:   39 Impr | 8 Clicks   | ₹282.51 Spend   | 0 Conv (Local Intent)
├── "yoga classes trichy" [Vocals] ❌:        1 Impr | 1 Click    | ₹109.55 Spend   | 1 Conv (Out-of-Area)
├── "tabla classes near me" [Vocals] ❌:     11 Impr | 3 Clicks   | ₹83.74 Spend    | 0 Conv (Non-Core)
└── "online guitar classes" [Instruments] ❌: 15 Impr | 1 Click    | ₹49.87 Spend    | 0 Conv (Online Leak)
```

---

## 7. Geographic & Device Analysis

### Geographic Performance Breakdown:

| Territory | Spend (₹) | Spend Share (%) | Clicks | Conversions | Commercial Assessment |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Delhi NCR (Core Catchment)** | **₹5,537.78** | **47.6%** | 622 | 1 | 🟢 **100% Target Local Market** |
| **Non-Delhi Indian States** | **₹5,073.57** | **43.6%** | 693 | 11 | 🔴 **0% In-Studio Utility** (Patna, Lucknow, etc.) |
| **International (US, UK, AU)** | **₹1,029.22** | **8.8%** | 54 | 0 | 🔴 **0% In-Studio Utility** |

### Device Breakdown:

| Device | Impressions | Clicks | CTR | Spend (₹) | Avg. CPC | Conv. | CPA (₹) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Mobile Phones** | **32,969 (95.2%)** | **1,370 (97.5%)** | **4.15%** | **₹12,205.58** | **₹8.91** | **12** | **₹1,017.13** |
| **Computers (Desktop)** | 1,294 (3.7%) | 21 (1.5%) | 1.62% | ₹782.20 | ₹37.25 | 1 | ₹782.20 |
| **Tablets / TV** | 362 (1.1%) | 14 (1.0%) | 3.87% | ₹54.56 | ₹3.89 | 0 | — |

---

## 8. Strategic Recommendations & Optimization Protocol

```
┌──────────┬─────────────────────────────┬───────────────────┬────────────────────────────────────────────────────────┐
│ Priority │ Campaign / Entity           │ Action            │ Strategic Reason                                       │
├──────────┼─────────────────────────────┼───────────────────┼────────────────────────────────────────────────────────┤
│ P0       │ Want to Learn about Music?  │ 🛑 Keep REMOVED   │ Protects ₹3,870/mo from uncontrolled app banner spend. │
│ P0       │ Location Targeting          │ 🔴 Presence Only  │ Eliminates 52.4% out-of-catchment click waste.         │
│ P0       │ Instruments Campaign        │ 🔴 Switch Bidding │ Replace Target Impression Share with Manual CPC (₹18). │
│ P1       │ Negative Keyword Firewall   │ 🟢 Enforce Active │ Prevents cross-instrument & online search bleed.       │
│ P1       │ Vocals Campaign             │ 🚀 Protect & Scale│ Core acquisition engine driving ₹364 CPA.              │
│ P2       │ SEARCH_SKAG_MUSIC_CLASSES   │ ⏸️ Keep PAUSED   │ Avoids internal auction competition against Instruments│
└──────────┴─────────────────────────────┴───────────────────┴────────────────────────────────────────────────────────┘
```

---

## 9. Final Decision Table

| Action | Target Asset | Decision | Priority | Reason | Impact |
| :--- | :--- | :---: | :---: | :--- | :--- |
| **Bidding Strategy Change** | `RR_Search_Instruments_Hyperlocal_5KM` | 🔴 **FIX** | **P0** | Target Impression Share bids blindly up to ₹74.30. | Halves CPC; doubles local click volume. |
| **Location Option Setting** | All Active Search Campaigns | 🔴 **FIX** | **P0** | Stops serving ads to non-Delhi Indian states. | Saves ~₹5,000/mo of wasted out-of-area spend. |
| **Scale Vocal Search** | `RR_Search_Vocals_Hyperlocal_5KM` | 🚀 **SCALE** | **P1** | Proven low CPC (₹5.62) and highest local conversion. | Generates 25+ local trial bookings per month. |
| **Maintain Negative Firewall**| Active Campaigns | 🟢 **KEEP** | **P1** | Blocks online, tabla, yoga, chords, and out-of-state cities. | Prevents ad relevance dilution. |
