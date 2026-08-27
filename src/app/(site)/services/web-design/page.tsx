import WebDesignNav from "./components/WebDesignNav";
import WebDesignHero from "./components/WebDesignHero";
import WebDesignMarquee from "./components/WebDesignMarquee";
import WebDesignBenefits from "./components/WebDesignBenefits";
import ShowcaseStack from "./components/ShowcaseStack";
import WhyBizRavanaBento from "./components/WhyBizRavanaBento";
import ArchitectureFlowDiagram from "./components/ArchitectureFlowDiagram";
import TechOrbitHub from "./components/TechOrbitHub";
import PricingTiers from "./components/PricingTiers";
import TestimonialsSection from "./components/TestimonialsSection";
import FaqAccordion from "./components/FaqAccordion";
import FinalCta from "./components/FinalCta";
import ContactFormSection from "./components/ContactFormSection";
import WebDesignFooter from "./components/WebDesignFooter";
import JsonLd from "@/components/json-ld";
import { SITE_URL, CONTACT } from "@/config/site";

const webDesignServiceJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: "BizRavana Web Design & Development",
  url: `${SITE_URL}/services/web-design`,
  image: `${SITE_URL}/icon-512x512.png`,
  description:
    "Bespoke, high-performance website design and Next.js web development for Sri Lankan businesses and global brands.",
  telephone: `+94${CONTACT.phone.slice(1)}`,
  email: CONTACT.email,
  areaServed: [
    {
      "@type": "Country",
      name: "Sri Lanka",
    },
    {
      "@type": "AdministrativeArea",
      name: "Worldwide",
    },
  ],
  priceRange: "$$",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Web Design Packages",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Starter Website",
          description: "High-converting single page or landing site for small businesses.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Growth Multi-Page Website",
          description: "Multi-page website with custom design, animations, and lead capture workflows.",
        },
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: "Custom Web Application & eCommerce",
          description: "Full-scale custom Next.js web application or online store with custom CMS.",
        },
      },
    ],
  },
};

const webDesignFaqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How long does it take to build a website?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most websites take around 5–21 working days, depending on the package, content and complexity.",
      },
    },
    {
      "@type": "Question",
      name: "Do you provide the domain and hosting?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We can help you set up your domain and hosting. Hosting and domain fees may be billed separately depending on the selected setup.",
      },
    },
    {
      "@type": "Question",
      name: "Can you redesign my existing website?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. We can redesign an existing website while improving its visual design, usability, mobile experience and performance.",
      },
    },
    {
      "@type": "Question",
      name: "Will my website work on mobile phones?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. All websites are designed to be responsive across mobile, tablet and desktop devices.",
      },
    },
    {
      "@type": "Question",
      name: "Can I update the website myself?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For websites that include a CMS or admin panel, you can manage supported content yourself. Otherwise, our maintenance plans can handle ongoing updates.",
      },
    },
  ],
};

export default function WebDesignPage() {
  return (
    <main className="relative min-h-screen bg-[#060608] text-white">
      {/* Structured data — Service & FAQs */}
      <JsonLd data={webDesignServiceJsonLd} />
      <JsonLd data={webDesignFaqJsonLd} />
      {/* Background Grid Pattern Overlay */}
      <div className="wd-bg-grid" />

      {/* Floating HUD Navigation */}
      <WebDesignNav />

      {/* Hero Section */}
      <WebDesignHero />

      {/* Dual Row Scroll-Driven Marquee Section with Demo Cards */}
      <WebDesignMarquee />

      {/* Value Proposition, Manifesto & Services Section */}
      <WebDesignBenefits />

      {/* Featured Case Studies Showcase */}
      <ShowcaseStack />

      {/* "All Done In One" Node Flow Diagram */}
      <ArchitectureFlowDiagram />

      {/* Tech Orbit Visual Hub */}
      <TechOrbitHub />

      {/* Pricing / Investment Tiers */}
      <PricingTiers />

      {/* Why BizRavana Bento Grid (High-Contrast White & Black Cards) */}
      <WhyBizRavanaBento />



      {/* Interactive Client Testimonials Section */}
      <TestimonialsSection />

      {/* FAQ Accordion */}
      <FaqAccordion />

      {/* Cinematic Final project CTA section */}
      <FinalCta />



      {/* High-Contrast Interactive Contact Form Section */}
      <ContactFormSection />

      {/* Futuristic Watermark Footer */}
      <WebDesignFooter />
    </main>
  );
}
