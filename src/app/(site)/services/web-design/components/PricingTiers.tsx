"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight } from "lucide-react";

const TIERS = [
  {
    name: "Starter",
    price: "Rs. 25,000",
    desc: "For businesses getting online",
    bestFor: "Small businesses, personal brands, freelancers, and new ventures.",
    features: [
      "Up to 3 custom pages",
      "Custom mobile-first design",
      "WhatsApp ordering integration",
      "Fast contact form & Google Maps",
      "Core SEO & structured metadata",
      "Social media connectivity",
      "Sub-second load optimization",
    ],
    popular: false,
    cta: "Get Started",
    waMsg: "Hi BizRavana! I would like to get started with the Starter Web Design package (Rs. 25,000) for my business.",
  },
  {
    name: "Business",
    price: "Rs. 45,000",
    desc: "For businesses ready to scale",
    bestFor: "Established businesses that need high conversion and strong presence.",
    features: [
      "Up to 7 custom pages",
      "Everything in Starter package",
      "Interactive product / service showcase",
      "Multi-category gallery studio",
      "Google Analytics & event tracking",
      "Enhanced local SEO architecture",
      "High-speed Core Web Vitals",
      "Priority WhatsApp support",
    ],
    popular: true,
    cta: "Choose Business",
    waMsg: "Hi BizRavana! I would like to get started with the Business Web Design package (Rs. 45,000) for my business.",
  },
  {
    name: "Premium",
    price: "Rs. 80,000+",
    desc: "For ambitious digital brands",
    bestFor: "Brands that need custom functionality, 3D accents, or online store engines.",
    features: [
      "Custom page architecture",
      "3D interactive accents & animations",
      "Custom CMS or dashboard features",
      "Advanced technical SEO engine",
      "Sub-second speed optimization",
      "Custom API integrations",
      "24/7 dedicated support priority",
    ],
    popular: false,
    cta: "Let's Talk",
    waMsg: "Hi BizRavana! I would like to talk about the Premium Web Design package (Rs. 80,000+) for my business.",
  },
];

export default function PricingTiers() {
  return (
    <section id="pricing" className="py-28 relative bg-[#0C0C0C] border-t border-white/[0.06] overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#fd3a25]/6 blur-[160px] rounded-full pointer-events-none -z-10" />

      <div className="wd-container relative z-10 max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="wd-badge-mono mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#ff6b57]" />
            <span>[ SIMPLE, TRANSPARENT PRICING ]</span>
          </div>

          <h2
            className="hero-heading font-kanit font-black uppercase leading-none tracking-tight text-center select-none mb-6"
            style={{ fontSize: "clamp(2.8rem, 11vw, 150px)" }}
          >
            PRICING
          </h2>

          <p className="text-neutral-400 text-sm sm:text-base font-kanit max-w-xl mx-auto leading-relaxed">
            Start with what you need today. Upgrade when your business is ready for more. No hidden fees.
          </p>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-6xl mx-auto">
          {TIERS.map((tier, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative flex flex-col rounded-[36px] sm:rounded-[48px] p-7 sm:p-9 transition-all duration-300 ${
                tier.popular
                  ? "border-2 border-[#fd3a25] bg-[#120807] shadow-[0_0_70px_rgba(253,58,37,0.25),0_30px_70px_rgba(0,0,0,0.8)] lg:-translate-y-3 z-10"
                  : "border-2 border-[#D7E2EA]/25 bg-[#0C0C0C] hover:border-white/50 shadow-[0_25px_60px_rgba(0,0,0,0.85)]"
              }`}
            >
              {/* Popular Highlight Tag */}
              {tier.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-[#fd3a25] text-white text-[10px] font-mono font-black uppercase tracking-wider shadow-lg shadow-[#fd3a25]/40">
                    <Sparkles className="w-3 h-3 fill-white" />
                    MOST POPULAR
                  </span>
                </div>
              )}

              <div className="flex flex-col justify-between h-full">
                <div>
                  {/* Top header row */}
                  <div className="flex items-start justify-between gap-3 mb-6">
                    <h3 className="text-2xl sm:text-3xl font-black font-kanit uppercase text-white tracking-tight">
                      {tier.name}
                    </h3>
                  </div>

                  {/* Price Block */}
                  <div className="mb-6 pb-6 border-b border-white/[0.08]">
                    <div className="flex items-baseline gap-2 mb-1.5">
                      <span
                        className={`text-3xl sm:text-4xl lg:text-5xl font-black font-kanit tracking-tight ${
                          tier.popular ? "text-[#ff8a7a]" : "text-white"
                        }`}
                      >
                        {tier.price}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 uppercase tracking-wider font-mono">
                      {tier.desc}
                    </p>
                  </div>

                  {/* Best For */}
                  <div
                    className={`p-3.5 rounded-2xl mb-6 ${
                      tier.popular
                        ? "bg-[#fd3a25]/[0.08] border border-[#fd3a25]/25"
                        : "bg-white/[0.03] border border-white/[0.06]"
                    }`}
                  >
                    <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 font-bold mb-1">
                      Ideal For
                    </p>
                    <p className="text-xs text-neutral-200 leading-relaxed font-light">
                      {tier.bestFor}
                    </p>
                  </div>

                  {/* Feature List */}
                  <div className="space-y-2.5 mb-8">
                    <p className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 font-bold mb-3">
                      Included Deliverables
                    </p>
                    {tier.features.map((feat, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-neutral-300 leading-relaxed font-light"
                      >
                        <span
                          className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                            tier.popular
                              ? "bg-[#fd3a25]/20 text-[#ff8a7a]"
                              : "bg-white/[0.08] text-neutral-300"
                          }`}
                        >
                          <Check className="w-2.5 h-2.5 stroke-[3px]" />
                        </span>
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="pt-2">
                  <a
                    href={`https://wa.me/94750350109?text=${encodeURIComponent(tier.waMsg)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full text-center py-3.5 rounded-full font-kanit font-semibold text-xs sm:text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
                      tier.popular
                        ? "wd-contact-pill-btn"
                        : "wd-ghost-pill-btn"
                    }`}
                  >
                    <span>{tier.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
