import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Offer } from "@/components/landing/Offer";
import { Courses } from "@/components/landing/Courses";
import { Trust, Benefits, WhoItsFor, Objections, HowItWorks } from "@/components/landing/Sections";
import { Gallery, Testimonials } from "@/components/landing/Social";
import { Faq, LeadFormSection } from "@/components/landing/FaqLead";
import { Footer, StickyCta } from "@/components/landing/Footer";
import { FAQS } from "@/components/landing/constants";

const TITLE = "Rhythm Raga — Music, Dance & Art Classes in GTB Nagar, Delhi";
const DESCRIPTION =
  "Learn Guitar, Piano, Drums, Singing, Zumba & Art from expert mentors in GTB Nagar, Delhi. Kids & adults welcome. Book your free trial class today!";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          name: "Rhythm Raga Creative Learning Academy",
          description: DESCRIPTION,
          address: {
            "@type": "PostalAddress",
            streetAddress: "Gate 4, GTB Nagar Metro Station, 2529 Basement",
            addressLocality: "GTB Nagar",
            addressRegion: "Delhi",
            postalCode: "110009",
            addressCountry: "IN",
          },
          telephone: "+91-8796574448",
          openingHours: ["Mo-Su 11:00-21:00"],
          priceRange: "₹₹",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "5.0",
            reviewCount: "12",
          },
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
