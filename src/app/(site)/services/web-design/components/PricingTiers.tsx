"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight, Clock } from "lucide-react";

const TIERS = [
  {
    name: "STARTER",
    price: "Rs. 35,000",
    badge: "ESSENTIAL",
    desc: "For individuals and small businesses that need a professional online presence.",
    timeline: "5–7 day delivery",
    features: [
      "Up to 3 pages",
      "Custom responsive design",
      "WhatsApp integration",
      "Contact form",
      "Google Maps",
      "Social media links",
      "Basic SEO",
      "Domain & hosting setup",
      "2 revision rounds",
    ],
    popular: false,
    cta: "Get Started",
  },
  {
    name: "BUSINESS",
    price: "Rs. 65,000",
    badge: "MOST POPULAR",
    desc: "For growing businesses that need a complete professional website.",
    timeline: "7–14 day delivery",
    features: [
      "Up to 7 pages",
      "Custom UI design",
      "Mobile-first development",
      "WhatsApp integration",
      "Contact forms",
      "Gallery",
      "Google Maps",
      "Basic SEO",
      "Analytics setup",
      "Speed optimization",
      "Domain & hosting setup",
      "3 revision rounds",
    ],
    popular: true,
    cta: "Choose Business",
  },
  {
    name: "PREMIUM",
    price: "Rs. 120,000+",
    badge: "ENTERPRISE",
    desc: "For businesses that need a more advanced digital experience.",
    timeline: "14–21 day delivery",
    features: [
      "8–15+ pages",
      "Premium custom design",
      "Advanced interactions",
      "CMS / Admin panel",
      "Advanced SEO foundation",
      "Analytics",
      "Performance optimization",
      "Custom integrations",
      "Advanced forms",
      "Content management",
      "5 revision rounds",
    ],
    popular: false,
    cta: "Let's Talk",
  },
];

export default function PricingTiers() {
  return (
    <section id="pricing" className="py-24 relative bg-[#040406]">
      <div className="wd-container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="wd-badge-mono mb-4">
            <span className="wd-dot-pulse" />
            <span>[ PRICING ]</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Simple Plans. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8be0b7] via-[#6fc59b] to-white">
              Clear Pricing.
            </span>
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base">
            Transparent investment for Sri Lankan businesses. 100% bespoke quality with zero hidden maintenance fees.
          </p>
        </div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {TIERS.map((tier, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`wd-glass-card p-8 sm:p-10 flex flex-col justify-between relative transition-all duration-300 ${
                tier.popular
                  ? "border-[#6fc59b] shadow-[0_0_50px_rgba(111,197,155,0.35)] bg-gradient-to-b from-[#0e2118] via-[#0d1612] to-[#08090d] scale-100 lg:scale-105 z-10"
                  : "border-white/[0.08] hover:border-white/20"
              }`}
            >
              <div>
                {/* Top Badge & Tier Label */}
                <div className="flex items-center justify-between mb-4">
                  {tier.popular ? (
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gradient-to-r from-[#8be0b7] via-[#6fc59b] to-[#48a877] text-[#08090d] text-[10px] font-mono font-black uppercase tracking-wider shadow-lg shadow-[#6fc59b]/40">
                      <Sparkles className="w-3 h-3 fill-[#08090d]" />
                      {tier.badge}
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider px-2.5 py-0.5 rounded bg-white/[0.04] border border-white/10">
                      {tier.badge}
                    </span>
                  )}

                  {tier.popular && (
                    <span className="text-[10px] font-mono text-[#8be0b7] font-bold tracking-wider">
                      RECOMMENDED
                    </span>
                  )}
                </div>

                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                  {tier.name}
                </h3>

                {/* Price Display */}
                <div className="flex items-baseline gap-1 my-4 pb-4 border-b border-white/[0.08]">
                  <span
                    className={`text-3xl sm:text-4xl font-black tracking-tight ${
                      tier.popular ? "text-[#8be0b7]" : "text-white"
                    }`}
                  >
                    {tier.price}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 mb-6 leading-relaxed">
                  {tier.desc}
                </p>

                {/* Timeline Tag */}
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
                    <Clock className="w-3.5 h-3.5 text-[#6fc59b]" />
                    <span>Estimated Timeline</span>
                  </div>
                  <span className="text-xs font-bold text-white font-mono">{tier.timeline}</span>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-10">
                  <div className="text-[11px] font-mono uppercase tracking-wider text-neutral-400 font-bold mb-2">
                    Includes:
                  </div>
                  {tier.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-3 text-xs text-neutral-200">
                      <Check className="w-4 h-4 text-[#8be0b7] flex-shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA Action */}
              <a
                href={`https://wa.me/94750350109?text=${encodeURIComponent(
                  `Hi BizRavana! I would like to choose the ${tier.name} package (${tier.price}) for my website.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full text-center py-3.5 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 ${
                  tier.popular
                    ? "bg-gradient-to-r from-[#8be0b7] via-[#6fc59b] to-[#48a877] text-[#08090d] shadow-lg shadow-[#6fc59b]/40 hover:scale-[1.02] hover:shadow-[#6fc59b]/60"
                    : "bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/15"
                }`}
              >
                <span>{tier.cta}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
