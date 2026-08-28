import csv
import os

def generate_top_performing_ad_groups():
    output_dir = "google_ads_upload_package"
    os.makedirs(output_dir, exist_ok=True)

    campaign_name = "SEARCH_SKAG_MUSIC_CLASSES_GTB_NAGAR__DELHI"
    
    ad_groups_data = [
        {
            "name": "Top Performers - Guitar Classes",
            "cpc": "75.00",
            "keywords": [
                ("guitar classes near me", "Exact match"),
                ("guitar classes near me", "Phrase match"),
                ("guitar classes in gtb nagar", "Exact match"),
                ("guitar classes in gtb nagar", "Phrase match"),
                ("guitar lessons near me", "Phrase match"),
                ("learn guitar in delhi", "Phrase match"),
            ],
            "headlines": [
                "Guitar Classes Near Me",
                "Learn Guitar in GTB Nagar",
                "1-on-1 Certified Mentors",
                "Acoustic & Electric Guitar",
                "Near GTB Nagar Metro Gate 4",
                "Book Free Studio Demo",
                "Small Batches (Max 4-5)",
                "Beginner to Advanced Guitar",
                "Flexible Morning & Evening",
                "Hudson Lane Music Studio",
                "Master Chords & Strumming",
                "Guitar Lessons For All Ages",
                "Hands-On Studio Practice",
                "Call or WhatsApp Today",
                "Top Rated Music Academy"
            ],
            "descriptions": [
                "Learn acoustic & electric guitar at GTB Nagar. 1-on-1 certified mentors & small batches.",
                "In-studio guitar lessons near Metro Gate 4 Hudson Lane. Book your free demo class today!",
                "Step-by-step guitar coaching for kids & adults. Flexible weekday & weekend batch timings.",
                "Delhi's top rated guitar coaching institute in North Delhi. Call or WhatsApp to join!"
            ],
            "path1": "Guitar",
            "path2": "GtbNagar",
            "final_url": "https://rhythmraga.in/book?course=Guitar"
        },
        {
            "name": "Top Performers - Piano & Keyboard",
            "cpc": "70.00",
            "keywords": [
                ("piano classes near me", "Exact match"),
                ("piano classes near me", "Phrase match"),
                ("keyboard classes near me", "Exact match"),
                ("keyboard classes in gtb nagar", "Phrase match"),
                ("learn piano in delhi", "Phrase match"),
                ("piano teacher north delhi", "Phrase match")
            ],
            "headlines": [
                "Piano Classes Near Me",
                "Piano Lessons in GTB Nagar",
                "Keyboard Classes Near Me",
                "1-on-1 Certified Mentors",
                "Classical & Western Piano",
                "Near GTB Nagar Metro Gate 4",
                "Book Free Studio Demo",
                "Small Batches (Max 4-5)",
                "Beginner to Advanced Piano",
                "Flexible Batch Timings",
                "Learn Staff & Key Theory",
                "Piano Lessons For All Ages",
                "Hands-On Keyboard Practice",
                "Call or WhatsApp Today",
                "Top Music Academy Delhi"
            ],
            "descriptions": [
                "Master classical & western piano at GTB Nagar. 1-on-1 certified guidance & small batches.",
                "In-studio piano & keyboard classes near Metro Gate 4. Book your free studio trial class today!",
                "Structured piano lessons for kids & adults in North Delhi. Flexible morning & evening batches.",
                "Top rated music academy near Hudson Lane. Call or WhatsApp to start your musical journey!"
            ],
            "path1": "Piano",
            "path2": "GtbNagar",
            "final_url": "https://rhythmraga.in/book?course=Piano"
        },
        {
            "name": "Top Performers - Drum Lessons",
            "cpc": "70.00",
            "keywords": [
                ("drum classes near me", "Exact match"),
                ("drum classes near me", "Phrase match"),
                ("drum lessons in delhi", "Exact match"),
                ("drum classes in gtb nagar", "Phrase match"),
                ("learn drums near me", "Phrase match")
            ],
            "headlines": [
                "Drum Classes Near Me",
                "Drum Lessons in GTB Nagar",
                "Learn Drums in North Delhi",
                "Acoustic Drum Kits Setup",
                "1-on-1 Certified Drum Mentors",
                "Near GTB Nagar Metro Gate 4",
                "Book Free Drum Studio Trial",
                "Small Batches (Max 4-5)",
                "Master Rhythm & Beats",
                "Beginner to Pro Drumming",
                "Soundproof Practice Rooms",
                "Flexible Batch Timings",
                "Hands-On Studio Drumming",
                "Call or WhatsApp Today",
                "Top Rated Music Academy"
            ],
            "descriptions": [
                "Hands-on acoustic drum lessons in GTB Nagar. 1-on-1 certified coaching & rhythm training.",
                "In-studio drum classes near Metro Gate 4 Hudson Lane. Book your 30-min trial session today!",
                "Learn beats, tempo & acoustic drum kits. Small batches with flexible morning & evening slots.",
                "North Delhi's premier rhythm & drum academy. Call or WhatsApp us to reserve your seat!"
            ],
            "path1": "Drums",
            "path2": "GtbNagar",
            "final_url": "https://rhythmraga.in/book?course=Drums"
        },
        {
            "name": "Top Performers - Singing & Vocals",
            "cpc": "65.00",
            "keywords": [
                ("singing classes near me", "Exact match"),
                ("singing classes near me", "Phrase match"),
                ("vocal classes in gtb nagar", "Exact match"),
                ("classical singing classes delhi", "Phrase match"),
                ("music vocal coach near me", "Phrase match"),
                ("learn singing in delhi", "Phrase match")
            ],
            "headlines": [
                "Singing Classes Near Me",
                "Vocal Classes in GTB Nagar",
                "Classical & Western Singing",
                "1-on-1 Certified Vocal Coach",
                "Near GTB Nagar Metro Gate 4",
                "Book Free Singing Demo",
                "Pitch & Voice Modulation",
                "Small Batches (Max 4-5)",
                "Beginner to Advanced Vocals",
                "Flexible Batch Timings",
                "Hindustani Classical Singing",
                "Vocal Lessons For All Ages",
                "In-Studio Microphone Practice",
                "Call or WhatsApp Today",
                "Top Rated Music Academy"
            ],
            "descriptions": [
                "Classical & western vocal coaching in GTB Nagar. Master pitch, breath control & scale modulation.",
                "In-studio singing lessons near Metro Gate 4 Hudson Lane. Book your free vocal trial today!",
                "Personalized 1-on-1 vocal guidance for kids & adults. Flexible morning & evening batch slots.",
                "North Delhi's trusted singing academy near Delhi University. Call or WhatsApp to join!"
            ],
            "path1": "Vocals",
            "path2": "GtbNagar",
            "final_url": "https://rhythmraga.in/book?course=Vocals"
        },
        {
            "name": "Top Performers - Music Academy & School",
            "cpc": "75.00",
            "keywords": [
                ("music academy near me", "Exact match"),
                ("music academy near me", "Phrase match"),
                ("music institute in gtb nagar", "Exact match"),
                ("music school north delhi", "Phrase match"),
                ("best music academy in delhi", "Exact match"),
                ("best music academy in delhi", "Phrase match")
            ],
            "headlines": [
                "Music Academy Near Me",
                "Music Institute in GTB Nagar",
                "Best Music Academy Delhi",
                "Guitar Piano Drums Vocals",
                "1-on-1 Certified Mentors",
                "Near GTB Nagar Metro Gate 4",
                "Book Free Studio Demo",
                "Small Batches (Max 4-5)",
                "Beginner to Advanced Levels",
                "Flexible Batch Timings",
                "AC Soundproof Studios",
                "Music Classes Kids & Adults",
                "Hudson Lane Music School",
                "Call or WhatsApp Today",
                "Premier Delhi Music Academy"
            ],
            "descriptions": [
                "Premier physical music academy in GTB Nagar. Guitar, Piano, Drums, Vocals with expert mentors.",
                "Located near Metro Gate 4 Hudson Lane. Fully soundproof studios with acoustic instruments.",
                "Flexible morning & evening offline batches for all ages. Book your free 30-min trial demo today!",
                "North Delhi's top rated offline music institute. Call or WhatsApp us to get batch details!"
            ],
            "path1": "Academy",
            "path2": "GtbNagar",
            "final_url": "https://rhythmraga.in/book"
        }
    ]

    # 1. New Ad Groups CSV
    ag_csv = os.path.join(output_dir, "new_top_performing_ad_groups.csv")
    with open(ag_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Row Type", "Action", "Ad group status", "Campaign", "Ad group",
            "Ad group type", "Default max. CPC"
        ])
        for ag in ad_groups_data:
            writer.writerow([
                "Ad group", "Add", "Enabled", campaign_name, ag["name"], "Standard", ag["cpc"]
            ])

    # 2. New Keywords CSV
    kw_csv = os.path.join(output_dir, "new_top_performing_keywords.csv")
    with open(kw_csv, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "Row Type", "Action", "Keyword status", "Campaign", "Ad group",
            "Keyword", "Type", "Default max. CPC"
        ])
        for ag in ad_groups_data:
            for kw, match in ag["keywords"]:
                writer.writerow([
                    "Keyword", "Add", "Enabled", campaign_name, ag["name"],
                    kw, match, ag["cpc"]
                ])

    # 3. New RSAs CSV
    rsa_csv = os.path.join(output_dir, "new_top_performing_rsas.csv")
    with open(rsa_csv, "w", newline="", encoding="utf-8") as f:
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
        for ag in ad_groups_data:
            row = [
                "Ad", "Add", "Enabled", campaign_name, ag["name"],
                "Responsive search ad", ag["final_url"], ag["path1"], ag["path2"]
            ] + ag["headlines"] + ag["descriptions"] + ["1"]
            writer.writerow(row)

    print("✅ Successfully generated top performing ad groups, keywords, and RSAs CSVs.")

if __name__ == "__main__":
    generate_top_performing_ad_groups()
