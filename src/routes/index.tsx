import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Offer } from "@/components/landing/Offer";
import { Courses } from "@/components/landing/Courses";
import { PainPoints, Benefits, WhyUs, WhoCanJoin, HowItWorks } from "@/components/landing/Sections";
import { Gallery, Testimonials } from "@/components/landing/Social";
import { Faq, LeadForm } from "@/components/landing/FaqLead";
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
            addressLocality: "GTB Nagar",
            addressRegion: "Delhi",
            addressCountry: "IN",
          },
          telephone: "+91-9999999999",
          openingHours: ["Mo-Sa 10:00-20:00", "Su 10:00-14:00"],
          priceRange: "₹₹",
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
      <Offer />
      <Courses />
      <PainPoints />
      <Benefits />
      <WhyUs />
      <WhoCanJoin />
      <HowItWorks />
      <Gallery />
      <Testimonials />
      <Faq />
      <LeadForm />
      <Footer />
      <StickyCta />
    </main>
  );
}
