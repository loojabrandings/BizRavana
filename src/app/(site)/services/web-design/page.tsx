import WebDesignNav from "./components/WebDesignNav";
import WebDesignHero from "./components/WebDesignHero";
import WebDesignIntro from "./components/WebDesignIntro";
import ShowcaseStack from "./components/ShowcaseStack";
import WhyBizRavanaBento from "./components/WhyBizRavanaBento";
import ArchitectureFlowDiagram from "./components/ArchitectureFlowDiagram";
import TechOrbitHub from "./components/TechOrbitHub";
import ImpactCounterSection from "./components/ImpactCounterSection";
import PricingTiers from "./components/PricingTiers";
import BizRavanaOmsBridge from "./components/BizRavanaOmsBridge";
import TestimonialsSection from "./components/TestimonialsSection";
import FaqAccordion from "./components/FaqAccordion";
import FinalLeadBooking from "./components/FinalLeadBooking";
import ContactFormSection from "./components/ContactFormSection";
import WebDesignFooter from "./components/WebDesignFooter";

export default function WebDesignPage() {
  return (
    <main className="relative min-h-screen bg-[#060608] text-white">
      {/* Background Grid Pattern Overlay */}
      <div className="wd-bg-grid" />

      {/* Floating HUD Navigation */}
      <WebDesignNav />

      {/* Hero Section */}
      <WebDesignHero />

      {/* Large Editorial Statement Intro Section */}
      <WebDesignIntro />

      {/* Featured Case Studies Showcase */}
      <ShowcaseStack />

      {/* Why BizRavana Bento Grid (High-Contrast White & Black Cards) */}
      <WhyBizRavanaBento />

      {/* "All Done In One" Node Flow Diagram */}
      <ArchitectureFlowDiagram />

      {/* Tech Orbit Visual Hub */}
      <TechOrbitHub />

      {/* Live Impact Counters */}
      <ImpactCounterSection />

      {/* Pricing / Investment Tiers */}
      <PricingTiers />

      {/* BizRavana OMS Native Ecosystem Cross-Sell */}
      <BizRavanaOmsBridge />

      {/* Interactive Client Testimonials Section */}
      <TestimonialsSection />

      {/* FAQ Accordion */}
      <FaqAccordion />

      {/* Final Lead Booking Matrix */}
      <FinalLeadBooking />

      {/* High-Contrast Interactive Contact Form Section */}
      <ContactFormSection />

      {/* Futuristic Watermark Footer */}
      <WebDesignFooter />
    </main>
  );
}
