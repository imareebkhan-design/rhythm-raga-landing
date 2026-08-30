import { createFileRoute } from "@tanstack/react-router";
import { SITE_URL, absoluteUrl } from "@/lib/site";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Offer } from "@/components/landing/Offer";
import { Courses } from "@/components/landing/Courses";
import { Trust, Benefits, WhoItsFor, Objections, HowItWorks } from "@/components/landing/Sections";
import { Gallery, Testimonials } from "@/components/landing/Social";
import { Faq, LeadFormSection } from "@/components/landing/FaqLead";
import { Footer, StickyCta } from "@/components/landing/Footer";
import { FAQS } from "@/components/landing/constants";

const TITLE = "Music Institute in GTB Nagar, Delhi | Rhytthm Raga";
const DESCRIPTION =
  "Rhytthm Raga — music classes near you in GTB Nagar, Delhi. Guitar, piano, drums, vocals and more for kids and adults. Book your free trial class today.";
const HOME_URL = absoluteUrl("/");
const OG_IMAGE = absoluteUrl("/og-rhythmraga.png");

const COURSES = ["Guitar", "Piano", "Drums", "Vocals"];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: HOME_URL },
      { property: "og:image", content: OG_IMAGE },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
    ],
    links: [{ rel: "canonical", href: HOME_URL }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": ["MusicSchool", "LocalBusiness", "EducationalOrganization"],
          "@id": `${SITE_URL}/#organization`,
          name: "Rhytthm Raga — School of Music and Arts",
          alternateName: ["Rhytthm Raga Music Academy", "RhythmRaga GTB Nagar"],
          description: DESCRIPTION,
          url: HOME_URL,
          image: OG_IMAGE,
          logo: absoluteUrl("/icon-512.png"),
          telephone: "+91-8796574448",
          email: "support@rhytthmraga.com",
          priceRange: "₹₹",
          currenciesAccepted: "INR",
          paymentAccepted: "Cash, UPI, Credit Card, Debit Card, Net Banking",
          hasMap: "https://www.google.com/maps/search/?api=1&query=Rhytthm+Raga+GTB+Nagar+Metro+Station+Gate+4+Delhi",
          geo: {
            "@type": "GeoCoordinates",
            latitude: 28.6977,
            longitude: 77.2069,
          },
          address: {
            "@type": "PostalAddress",
            streetAddress: "Gate 4, GTB Nagar Metro Station, 2529 Basement (opposite Domino's)",
            addressLocality: "GTB Nagar, North Delhi",
            addressRegion: "Delhi",
            postalCode: "110009",
            addressCountry: "IN",
          },
          areaServed: [
            { "@type": "Place", name: "GTB Nagar, Delhi" },
            { "@type": "Place", name: "Hudson Lane, Delhi" },
            { "@type": "Place", name: "Delhi University North Campus" },
            { "@type": "Place", name: "Model Town, Delhi" },
            { "@type": "Place", name: "Mukherjee Nagar, Delhi" },
            { "@type": "Place", name: "Kamla Nagar, Delhi" },
            { "@type": "Place", name: "Roop Nagar, Delhi" },
            { "@type": "Place", name: "Derawal Nagar, Delhi" },
            { "@type": "Place", name: "Civil Lines, Delhi" },
            { "@type": "Place", name: "Vijay Nagar, Delhi" },
          ],
          openingHoursSpecification: [
            {
              "@type": "OpeningHoursSpecification",
              dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
              opens: "11:00",
              closes: "21:00",
            },
          ],
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "5.0",
            reviewCount: "12",
            bestRating: "5",
            worstRating: "1",
          },
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Offline Music Classes & Voice Training Courses",
            itemListElement: [
              {
                "@type": "Course",
                name: "Offline Guitar Classes in GTB Nagar",
                description: "Learn Acoustic and Electric guitar, chord transitions, fingerpicking, and song performance from certified mentors.",
                provider: { "@id": `${SITE_URL}/#organization` },
                educationalCredentialAwarded: "Certificate of Completion",
                courseMode: "offline",
              },
              {
                "@type": "Course",
                name: "Piano & Keyboard Lessons in North Delhi",
                description: "Master western classical piano, keyboard chords, scales, synthesizers, and sheet music reading.",
                provider: { "@id": `${SITE_URL}/#organization` },
                educationalCredentialAwarded: "Certificate of Completion",
                courseMode: "offline",
              },
              {
                "@type": "Course",
                name: "Drum Classes & Percussion Lessons",
                description: "Acoustic drum kit lessons focusing on rhythm timing, hand-foot coordination, limb independence, and music grooves.",
                provider: { "@id": `${SITE_URL}/#organization` },
                educationalCredentialAwarded: "Certificate of Completion",
                courseMode: "offline",
              },
              {
                "@type": "Course",
                name: "Vocal Training & Classical Singing Classes",
                description: "Personalized voice coaching for Hindustani classical, Western vocal technique, pitch control, and vocal range expansion.",
                provider: { "@id": `${SITE_URL}/#organization` },
                educationalCredentialAwarded: "Certificate of Completion",
                courseMode: "offline",
              },
            ],
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          name: "Rhytthm Raga",
          url: HOME_URL,
          publisher: { "@id": `${SITE_URL}/#organization` },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQS.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        }),
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Trust />
      <Courses />
      <Benefits />
      <WhoItsFor />
      <Objections />
      <Offer />
      <HowItWorks />
      <Gallery />
      <Testimonials />
      <Faq />
      <LeadFormSection />
      <Footer />
      <StickyCta />
    </main>
  );
}
