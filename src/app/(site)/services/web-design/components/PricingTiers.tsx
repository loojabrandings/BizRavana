"use client";

import { motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";

const TIERS = [
  {
    name: "Starter",
    originalPrice: "Rs. 25,000",
    price: "Rs. 18,750",
    desc: "For businesses getting online",
    bestFor: "Small businesses, personal brands, freelancers, and new ventures.",
    features: [
      "Up to 3 pages",
      "Custom responsive design",
      "WhatsApp integration",
      "Contact form",
      "Google Maps",
      "Basic SEO setup",
      "Social media integration",
      "Mobile optimization",
    ],
    popular: false,
    cta: "Get Started →",
    waMsg: "Hi BizRavana! I would like to get started with the Starter Web Design package (Rs. 18,750) for my business.",
  },
  {
    name: "Business",
    originalPrice: "Rs. 45,000",
    price: "Rs. 34,500",
    desc: "For businesses ready to grow",
    bestFor: "Established businesses that need a stronger online presence.",
    features: [
      "Up to 7 pages",
      "Everything in Starter",
      "Product / service showcase",
      "Gallery",
      "Advanced contact options",
      "Google Analytics",
      "Enhanced SEO setup",
      "Performance optimization",
    ],
    popular: true,
    cta: "Choose Business →",
    waMsg: "Hi BizRavana! I would like to get started with the Business Web Design package (Rs. 34,500) for my business.",
  },
  {
    name: "Premium",
    originalPrice: "Rs. 80,000+",
    price: "Rs. 59,500+",
    desc: "For ambitious businesses",
    bestFor: "Businesses that need custom functionality or a more advanced digital experience.",
    features: [
      "Custom page architecture",
      "Advanced animations & interactions",
      "Custom functionality",
      "Advanced SEO",
      "Performance optimization",
      "Third-party integrations",
      "Priority support",
    ],
    popular: false,
    cta: "Let's Talk →",
    waMsg: "Hi BizRavana! I would like to talk about the Premium Web Design package (Rs. 59,500+) for my business.",
  },
];

export default function PricingTiers() {
  return (
    <section id="pricing" className="py-28 relative bg-[#040406] overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#fd3a25]/[0.04] blur-[120px] rounded-full pointer-events-none" />

      <div className="wd-container relative z-10">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="wd-badge-mono mb-5">
            <span className="wd-dot-pulse" />
            <span>[ SIMPLE, TRANSPARENT PRICING ]</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-5">
            Choose the Website That{" "}
            <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff8a7a] via-[#fd3a25] to-[#ff6b57]">
              Fits Your Business.
            </span>
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base leading-relaxed">
            Start with what you need today. Upgrade when your business is ready for more.
          </p>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-end max-w-6xl mx-auto">
          {TIERS.map((tier, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`relative flex flex-col rounded-[32px] border transition-all duration-300 ${tier.popular
                  ? "border-[#fd3a25]/50 bg-[#100604] shadow-[0_0_60px_rgba(253,58,37,0.18),0_30px_60px_rgba(0,0,0,0.6)] lg:scale-105 lg:-translate-y-2 z-10"
                  : "border-white/[0.07] bg-[#0b0c10]/95 hover:border-white/15 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                }`}
            >
              {/* Popular Highlight Strip */}
              {tier.popular && (
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#fd3a25] to-transparent rounded-t-[32px]" />
              )}

              <div className="p-8 sm:p-10 flex flex-col h-full">
                <div className="flex-1">
                  {/* Top header row */}
                  <div className="flex items-start justify-between gap-3 mb-7">
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                      {tier.name}
                    </h3>

                    {tier.popular && (
                      <span className="flex-shrink-0 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#fd3a25]/10 border border-[#fd3a25]/30 text-[#ff6b57] text-[9px] font-mono font-black uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 fill-[#ff6b57]" />
                        POPULAR
                      </span>
                    )}
                  </div>

                  {/* Price Block */}
                  <div className="mb-7 pb-7 border-b border-white/[0.07]">
                    {/* 25% Discount Row */}
                    <div className="flex items-center gap-2.5 mb-4">
                      <span className="px-3 py-1 rounded-full bg-[#fd3a25] text-white text-[11px] font-mono font-black uppercase tracking-wider shadow-[0_4px_14px_rgba(253,58,37,0.45)]">
                        25% OFF
                      </span>
                      <span className="text-sm sm:text-base font-bold text-neutral-400 line-through decoration-neutral-400 decoration-[1.5px]">
                        {tier.originalPrice}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2 mb-2">
                      <span
                        className={`text-4xl sm:text-5xl font-black tracking-tight ${tier.popular ? "text-[#ff6b57]" : "text-white"
                          }`}
                      >
                        {tier.price}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-neutral-400 uppercase tracking-widest font-bold font-mono">
                      {tier.desc}
                    </p>
                  </div>

                  {/* Best For */}
                  <div
                    className={`p-4 rounded-2xl mb-7 ${tier.popular
                        ? "bg-[#fd3a25]/[0.06] border border-[#fd3a25]/20"
                        : "bg-white/[0.03] border border-white/[0.06]"
                      }`}
                  >
                    <p className="text-[9px] font-mono uppercase tracking-[0.14em] text-neutral-500 font-bold mb-1.5">
                      Best For
                    </p>
                    <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-medium">
                      {tier.bestFor}
                    </p>
                  </div>

                  {/* Feature List */}
                  <div className="space-y-3 mb-10">
                    <p className="text-[9px] font-mono uppercase tracking-[0.14em] text-neutral-500 font-bold mb-4">
                      Includes
                    </p>
                    {tier.features.map((feat, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-start gap-3 text-xs sm:text-sm text-neutral-300 leading-relaxed"
                      >
                        <span
                          className={`mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${tier.popular
                              ? "bg-[#fd3a25]/15 text-[#ff6b57]"
                              : "bg-white/[0.06] text-neutral-400"
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
                <a
                  href={`https://wa.me/94750350109?text=${encodeURIComponent(tier.waMsg)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full text-center py-4 rounded-full font-bold text-sm transition-all duration-300 flex items-center justify-center gap-2 tracking-wide ${tier.popular
                      ? "bg-gradient-to-r from-[#ff6b57] via-[#fd3a25] to-[#e8321e] text-white shadow-[0_10px_35px_rgba(253,58,37,0.4)] hover:shadow-[0_15px_45px_rgba(253,58,37,0.55)] hover:scale-[1.02]"
                      : "bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15 hover:border-white/30"
                    }`}
                >
                  {tier.cta}
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
