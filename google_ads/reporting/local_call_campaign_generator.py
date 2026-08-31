import os
import csv

def generate_local_call_campaign():
    output_dir = "google_ads_local_calls_package"
    os.makedirs(output_dir, exist_ok=True)

    campaign_name = "LOCAL_CALLS_GMB_GTB_NAGAR_5KM"
    phone_number = "+918796574448"
    phone_country = "IN"
    verification_url = "https://www.rhytthmraga.com"

    # 1. Campaign CSV
    camp_csv = os.path.join(output_dir, "1_local_campaign.csv")
    with open(camp_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Row Type", "Action", "Campaign status", "Campaign", "Campaign type",
            "Networks", "Budget", "Budget type", "Bid strategy type", "Language",
            "Location", "Location type", "Location exclude type", "EU political ads"
        ])
        writer.writerow([
            "Campaign", "Add", "Enabled", campaign_name, "Search",
            "Google search", "350.00", "Daily", "Manual CPC",
            "en", "5.000000km around 28.697700 77.206900", "Location of presence", "Location of presence", "No"
        ])

    ad_groups = [
        {
            "name": "Call Intent - Music Academy Contact",
            "cpc": "45.00",
            "keywords": [
                ("music classes contact number gtb nagar", "Exact match"),
                ("music academy phone number near me", "Phrase match"),
                ("music school near gtb nagar metro", "Exact match"),
                ("call music classes north delhi", "Phrase match"),
                ("music academy near me contact", "Exact match"),
                ("music coaching number hudson lane", "Phrase match")
            ],
            "headlines": [
                "Call Rhytthm Raga Academy",
                "GTB Nagar Metro Gate 4",
                "1-on-1 Certified Mentors",
                "Offline Music Classes",
                "Guitar Piano Drums Vocals",
                "Book Free Trial Over Call",
                "Near Hudson Lane Delhi",
                "Small Batches Max 4-5",
                "Call Now For Batch Info",
                "Direct Call To Mentor",
                "Classes For Kids & Adults",
                "Flexible Batch Timings",
                "Instant Admission Support",
                "Top Music Academy Delhi",
                "Soundproof AC Studios"
            ],
            "descriptions": [
                "Speak directly with a music mentor. Offline guitar, piano, drums & vocals in GTB Nagar.",
                "Small batches near Hudson Lane. Call now to reserve your free in-person studio trial!",
                "Learn music instruments from scratch. Certified instructors & personalized coaching.",
                "North Delhi's premier music academy. Contact us today for batch timings & fees."
            ]
        },
        {
            "name": "Nearby Instruments - Call First",
            "cpc": "40.00",
            "keywords": [
                ("guitar classes near me call", "Exact match"),
                ("guitar classes in gtb nagar phone number", "Phrase match"),
                ("piano classes near me with fees", "Exact match"),
                ("drum classes in gtb nagar contact", "Phrase match"),
                ("singing classes near me phone number", "Exact match"),
                ("keyboard tutor near me contact", "Phrase match")
            ],
            "headlines": [
                "Call For Instrument Classes",
                "Guitar Piano Drums Vocals",
                "1-on-1 Certified Mentors",
                "GTB Nagar Metro Gate 4",
                "Book Free Studio Demo",
                "Learn Guitar From Scratch",
                "Piano & Keyboard Lessons",
                "Acoustic Drum Kits Setup",
                "Classical & Western Singing",
                "Small Batches Max 4-5",
                "Near Hudson Lane Delhi",
                "Morning & Evening Batches",
                "Call To Reserve Your Seat",
                "Top Rated Music Academy",
                "Hands-On Studio Practice"
            ],
            "descriptions": [
                "Call certified guitar, piano, drum & vocal mentors at GTB Nagar Metro Gate 4.",
                "In-studio offline classes for kids & adults. Call to schedule your free demo today!",
                "Master acoustic instruments in small batches. Flexible weekday & weekend timings.",
                "Speak with our senior faculty today for course structure, fees, and slot details."
            ]
        },
        {
            "name": "Neighborhood Areas - 5km Radius",
            "cpc": "42.00",
            "keywords": [
                ("music classes in hudson lane", "Exact match"),
                ("music classes in model town", "Phrase match"),
                ("music academy mukherjee nagar", "Exact match"),
                ("music coaching kamla nagar", "Phrase match"),
                ("best music academy in north campus", "Exact match"),
                ("music classes roop nagar delhi", "Phrase match"),
                ("music teacher civil lines delhi", "Phrase match")
            ],
            "headlines": [
                "Music Academy North Delhi",
                "Near Hudson Lane & DU",
                "GTB Nagar Metro Gate 4",
                "Music Classes Model Town",
                "Music School Mukherjee Nagar",
                "Music Classes Kamla Nagar",
                "1-on-1 Certified Mentors",
                "Book Free Studio Demo",
                "Guitar Piano Drums Vocals",
                "Small Batches Max 4-5",
                "Soundproof Practice Studios",
                "Flexible Student Batches",
                "Call Today For Admission",
                "Premier DU Music Hub",
                "Learn Music From Scratch"
            ],
            "descriptions": [
                "Serving Hudson Lane, Model Town & Mukherjee Nagar. In-studio offline music lessons.",
                "Just 2 mins from GTB Nagar Metro Gate 4. Call our academy to plan your first visit!",
                "Structured guitar, piano, drums & vocal coaching for students & adults in North Delhi.",
                "North Delhi's top rated creative music academy. Contact us today to book demo!"
            ]
        }
    ]

    # 2. Ad Groups CSV
    ag_csv = os.path.join(output_dir, "2_local_ad_groups.csv")
    with open(ag_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Row Type", "Action", "Ad group status", "Campaign", "Ad group",
            "Ad group type", "Default max. CPC"
        ])
        for ag in ad_groups:
            writer.writerow([
                "Ad group", "Add", "Enabled", campaign_name, ag["name"], "Standard", ag["cpc"]
            ])

    # 3. Keywords CSV
    kw_csv = os.path.join(output_dir, "3_local_keywords.csv")
    with open(kw_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Row Type", "Action", "Keyword status", "Campaign", "Ad group",
            "Keyword", "Type", "Default max. CPC"
        ])
        for ag in ad_groups:
            for kw, match in ag["keywords"]:
                writer.writerow([
                    "Keyword", "Add", "Enabled", campaign_name, ag["name"],
                    kw, match, ag["cpc"]
                ])

    # 4. Call-Only & Responsive Search Ads CSV
    ad_csv = os.path.join(output_dir, "4_local_ads.csv")
    with open(ad_csv, "w", newline="", encoding="utf-8") as f:
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
        for ag in ad_groups:
            row = [
                "Ad", "Add", "Enabled", campaign_name, ag["name"],
                "Responsive search ad", verification_url, "Call", "GTBNagar"
            ] + ag["headlines"] + ag["descriptions"] + ["1"]
            writer.writerow(row)

    # 5. Call Asset & Callouts CSV
    asset_csv = os.path.join(output_dir, "5_local_call_and_callout_assets.csv")
    with open(asset_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Row Type", "Action", "Level", "Campaign", "Asset type",
            "Callout text", "Phone number", "Country code", "Status"
        ])
        # Call Asset
        writer.writerow([
            "Asset", "Add", "Campaign", campaign_name, "Call",
            "", phone_number, phone_country, "Enabled"
        ])
        # Callouts
        callouts = [
            "Speak Directly to Mentor",
            "Gate 4 GTB Nagar Metro",
            "Book Free Demo Over Call",
            "Instant WhatsApp Support",
            "Small Batches (Max 4-5)",
            "Guitar Piano Drums Vocals"
        ]
        for c in callouts:
            writer.writerow([
                "Asset", "Add", "Campaign", campaign_name, "Callout",
                c, "", "", "Enabled"
            ])

    # 6. Negative Keywords CSV
    neg_csv = os.path.join(output_dir, "6_local_negatives.csv")
    with open(neg_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Row Type", "Action", "Keyword status", "Level", "Campaign", "Ad group",
            "Negative keyword", "Type"
        ])
        negatives = [
            "free chords", "free tabs", "free pdf", "free sheet music", "free download",
            "free lyrics", "chords", "tabs", "lyrics", "jobs", "job", "salary", "vacancy",
            "career", "hiring", "recruitment", "zoom classes", "online course", "virtual class",
            "olx", "quikr", "used instruments", "repair"
        ]
        for neg in negatives:
            writer.writerow([
                "Negative keyword", "Add", "Enabled", "Campaign", campaign_name, "",
                neg, "Broad match"
            ])

    # 7. Excluded Locations CSV (Firewall against out-of-state and international leakage)
    loc_csv = os.path.join(output_dir, "7_local_excluded_locations.csv")
    excluded_locations = [
        "Uttar Pradesh, India", "Bihar, India", "Maharashtra, India", "Karnataka, India",
        "Tamil Nadu, India", "West Bengal, India", "Gujarat, India", "Rajasthan, India",
        "Telangana, India", "Kerala, India", "Punjab, India", "Haryana, India",
        "Madhya Pradesh, India", "Odisha, India", "Andhra Pradesh, India", "Assam, India",
        "Jharkhand, India", "Uttarakhand, India", "Himachal Pradesh, India", "Jammu and Kashmir, India",
        "Goa, India", "Chhattisgarh, India", "Tripura, India", "Meghalaya, India", "Manipur, India",
        "United States", "Canada", "United Kingdom", "Australia", "Germany", "France",
        "South Africa", "Nigeria", "United Arab Emirates", "Pakistan", "Bangladesh",
        "Indonesia", "Kenya", "Uganda", "Malaysia", "Philippines", "Saudi Arabia", "Singapore"
    ]
    with open(loc_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Row Type", "Action", "Campaign", "Location", "Status"
        ])
        writer.writerow([
            "Location", "Add", campaign_name, "5.000000km around 28.697700 77.206900", "Enabled"
        ])
        for loc in excluded_locations:
            writer.writerow([
                "Location", "Add", campaign_name, loc, "Excluded"
            ])

    print("✅ Successfully generated Google My Business Local Call Campaign package with strict character lengths and 5km negative location firewall.")

if __name__ == "__main__":
    generate_local_call_campaign()
