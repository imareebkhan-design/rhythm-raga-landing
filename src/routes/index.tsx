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

const TITLE = "Music Institute in GTB Nagar, Delhi | RhythmRaga";
const DESCRIPTION =
  "RhythmRaga — music classes near you in GTB Nagar, Delhi. Guitar, piano, drums, vocals and more for kids and adults. Book your free trial class today.";
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
          "@type": ["MusicSchool", "LocalBusiness"],
          "@id": `${SITE_URL}/#organization`,
          name: "RhythmRaga — School of Music and Arts",
          alternateName: "Rhythm Raga Creative Learning Academy",
          description: DESCRIPTION,
          url: HOME_URL,
          image: OG_IMAGE,
          logo: absoluteUrl("/icon-512.png"),
          address: {
            "@type": "PostalAddress",
            streetAddress: "Gate 4, GTB Nagar Metro Station, 2529 Basement",
            addressLocality: "GTB Nagar",
            addressRegion: "Delhi",
            postalCode: "110009",
            addressCountry: "IN",
          },
          areaServed: { "@type": "Place", name: "GTB Nagar, North Delhi" },
          telephone: "+91-8796574448",
          openingHours: ["Mo-Su 11:00-21:00"],
          priceRange: "₹₹",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "5.0",
            reviewCount: "12",
          },
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Music classes",
            itemListElement: COURSES.map((c) => ({
              "@type": "Offer",
              itemOffered: {
                "@type": "Course",
                name: `${c} Classes`,
                provider: { "@id": `${SITE_URL}/#organization` },
              },
            })),
          },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "@id": `${SITE_URL}/#website`,
          name: "RhythmRaga",
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
