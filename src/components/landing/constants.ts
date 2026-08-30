export const PHONE = "+918796574448";
export const PHONE_DISPLAY = "+91 87965 74448";
// Secondary academy number (also shown in the footer).
export const PHONE_2 = "+918130251057";
export const PHONE_2_DISPLAY = "+91 81302 51057";
export const WHATSAPP_NUMBER = "918796574448";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi Rhytthm Raga! I'd like to book a free trial class.",
)}`;
export const CALL_LINK = `tel:${PHONE}`;
export const CALL_LINK_2 = `tel:${PHONE_2}`;

// Real address from the Google Business Profile.
export const ADDRESS =
  "Gate 4, GTB Nagar Metro Station, 2529 Basement (opposite Domino's, near McDonald's & Laxmi Dairy), Delhi 110009";

// Google Maps — link opens the listing; embed powers the footer map (no API key needed).
const MAPS_QUERY = encodeURIComponent("Rhytthm Raga, GTB Nagar Metro Station Gate 4, Delhi 110009");
export const MAPS_LINK = `https://www.google.com/maps/search/?api=1&query=${MAPS_QUERY}`;
export const MAPS_EMBED = `https://maps.google.com/maps?q=${MAPS_QUERY}&z=16&output=embed`;

// Verified Google Business Profile rating.
export const GOOGLE_RATING = "5.0";
export const GOOGLE_REVIEW_COUNT = 12;
export const GOOGLE_REVIEWS_LINK = MAPS_LINK;

export const FAQS = [
  {
    q: "How to learn guitar for beginners at RhythmRaga?",
    a: "Our beginner guitar course starts from scratch with open chords, strumming patterns, and finger placement. You will learn to play your first full song within 4 weeks with 1-on-1 certified mentor guidance.",
  },
  {
    q: "Do I need prior experience or my own instrument?",
    a: "No. Most students start with zero experience. All instruments (acoustic & electric guitars, 88-key pianos, synthesizers, and acoustic drum kits) are provided in our soundproof studio during class.",
  },
  {
    q: "Where is the music academy located in North Delhi?",
    a: "We are located at Gate 4, GTB Nagar Metro Station, 2529 Basement (opposite Domino's, near McDonald's & Hudson Lane). We are easily accessible from Civil Lines, Model Town, Mukherjee Nagar, Kamla Nagar, Roop Nagar, and DU North Campus.",
  },
  {
    q: "What music courses and instruments are offered?",
    a: "We offer 100% offline in-studio training for Acoustic & Electric Guitar, Piano & Digital Keyboard, Acoustic Drums & Percussion, and Singing/Vocal Training (Hindustani Classical & Western Contemporary).",
  },
  {
    q: "Are the classes offline or online?",
    a: "All classes are held 100% offline in person at our GTB Nagar academy for real hands-on learning, posture correction, and live mentor interaction.",
  },
  {
    q: "How does the free trial class work?",
    a: "Fill the short form on our website. Our team will call or message you on WhatsApp to schedule a free 30-minute studio demo where you meet your mentor and experience a lesson before enrolling.",
  },
  {
    q: "Do you offer vocal training for classical and Bollywood singing?",
    a: "Yes. Our vocal coaching covers voice culture, pitch training (Sur & Taal), breath control, Hindustani classical Raags, and contemporary Western/Bollywood vocal performance.",
  },
  {
    q: "Are weekend batches available for working professionals and college students?",
    a: "Yes. We offer flexible morning, evening, and weekend slots tailored for college students from Delhi University and working professionals across North Delhi.",
  },
];

