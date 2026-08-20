import WebDesignNav from "./components/WebDesignNav";
import WebDesignHero from "./components/WebDesignHero";
import WebDesignBenefits from "./components/WebDesignBenefits";
import ShowcaseStack from "./components/ShowcaseStack";
import WhyBizRavanaBento from "./components/WhyBizRavanaBento";
import ArchitectureFlowDiagram from "./components/ArchitectureFlowDiagram";
import TechOrbitHub from "./components/TechOrbitHub";
import PricingTiers from "./components/PricingTiers";
import TestimonialsSection from "./components/TestimonialsSection";
import FaqAccordion from "./components/FaqAccordion";
import LaunchOfferCta from "./components/LaunchOfferCta";
import FinalCta from "./components/FinalCta";
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

      {/* Launch Offer Announcement Strip */}
      <section className="relative py-4 bg-[#0d0302] border-y border-[#fd3a25]/15 overflow-hidden z-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-8 bg-[#fd3a25]/5 blur-xl rounded-full pointer-events-none" />
        <div className="wd-container relative flex flex-col sm:flex-row items-center justify-center gap-3 text-center text-xs sm:text-sm">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6b57] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#fd3a25]"></span>
            </span>
            <span className="font-bold text-white flex items-center gap-1.5">
              <span>🚀 Launch Offer</span>
              <span className="text-neutral-500 font-normal sm:inline hidden">|</span>
            </span>
          </div>
          <p className="text-neutral-300 font-medium">
            Special introductory pricing for our first 10 businesses. 
          </p>
          <a 
            href="#pricing" 
            className="text-[10px] font-mono text-[#ff6b57] hover:text-[#ff8a7a] underline decoration-[#ff6b57]/40 underline-offset-4 ml-1.5 font-bold transition-all"
          >
            View Pricing →
          </a>
        </div>
      </section>

      {/* Value Proposition & Benefits Section */}
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

      {/* Visually Distinct Launch Offer CTA block */}
      <LaunchOfferCta />



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
