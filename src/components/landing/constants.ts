export const PHONE = "+918796574448";
export const PHONE_DISPLAY = "+91 87965 74448";
// Secondary academy number (also shown in the footer).
export const PHONE_2 = "+918130251057";
export const PHONE_2_DISPLAY = "+91 81302 51057";
export const WHATSAPP_NUMBER = "918796574448";
export const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  "Hi Rhythm Raga! I'd like to book a free trial class.",
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
    q: "Do I need prior experience?",
    a: "No. Most of our students start as complete beginners. Every course begins with the fundamentals, and your mentor personalizes the pace to you.",
  },
  {
    q: "Is this suitable for beginners?",
    a: "Yes — beginners are our focus. Every course is designed to take you from zero, step by step, with hands-on guidance from your first class.",
  },
  {
    q: "What instruments can I learn?",
    a: "Guitar, Piano, Drums and Vocals are our main music courses. We also offer Zumba and Creative Art.",
  },
  {
    q: "Are the classes offline?",
    a: "Yes. All classes are held in person at our academy in GTB Nagar, Delhi — a real learning environment with mentors and other students.",
  },
  {
    q: "Where is the academy located?",
    a: "We're in GTB Nagar, Delhi. Once you enquire, our team will share the exact location and help you plan your first visit.",
  },
  {
    q: "How does the free trial work?",
    a: "Fill the short form and our team will call you. You visit the academy, meet your mentor and experience a class — free — before deciding anything.",
  },
  {
    q: "How do I know which course is right for me?",
    a: "Tell us what you're interested in and our team will help you pick the best starting point based on your goals.",
  },
  {
    q: "How do I get started?",
    a: "Fill the short enquiry form on this page. Our team will contact you shortly to help you choose a class and book your free trial.",
  },
];
