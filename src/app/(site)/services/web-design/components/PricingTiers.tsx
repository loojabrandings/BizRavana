"use client";

import { motion } from "framer-motion";
import { Check, Sparkles, ArrowRight, Clock } from "lucide-react";

const TIERS = [
  {
    name: "STARTER",
    originalPrice: "Rs. 25,000",
    price: "Rs. 18,750",
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
    originalPrice: "Rs. 45,000",
    price: "Rs. 33,750",
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
    originalPrice: "Rs. 120,000+",
    price: "Rs. 90,000+",
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

        {/* Promo Slot Counter Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto mb-16 p-6 sm:p-8 rounded-3xl border border-white/[0.06] bg-gradient-to-br from-[#0c0c0e] via-[#08080a] to-[#040406] shadow-[0_30px_100px_rgba(0,0,0,0.8)] relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-8"
        >
          {/* Decorative ambient background glows */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#6fc59b]/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#8be0b7]/10 blur-[100px] rounded-full pointer-events-none" />

          {/* Left: Campaign Info */}
          <div className="flex-1 space-y-4 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#6fc59b]/10 border border-[#6fc59b]/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#8be0b7] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6fc59b]"></span>
              </span>
              <span className="text-[10px] font-mono text-[#8be0b7] font-black tracking-widest uppercase">
                Launch Special Promotion
              </span>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                Get 25% Off Your Entire Project
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed max-w-md">
                We are offering exclusive introductory pricing to the first 10 businesses that build their bespoke websites with us. Lock in premium design and lifetime value.
              </p>
            </div>
            
            {/* Launch perks mini list */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 text-[11px] font-mono text-neutral-300">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#6fc59b]" />
                <span>Priority Booking Slot</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#6fc59b]" />
                <span>Price Lock for Addons</span>
              </div>
            </div>
          </div>

          {/* Right: Large Counter Sub-card */}
          <div className="w-full md:w-auto flex-shrink-0 z-10">
            <div className="p-8 rounded-3xl bg-[#08080a] border border-white/[0.08] flex flex-col items-center justify-center text-center relative overflow-hidden min-w-[250px] md:min-w-[280px] shadow-[0_15px_40px_rgba(0,0,0,0.5)]">
              {/* Subtle background slot graphic & ambient green glow */}
              <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#6fc59b]/8 via-transparent to-transparent pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 rounded-full bg-[#6fc59b]/5 blur-2xl pointer-events-none" />
              
              <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest mb-2 font-bold">
                Availability Status
              </span>
              
              {/* The Large Counter */}
              <div className="flex items-baseline justify-center gap-1.5 my-3 relative">
                {/* Glow ring */}
                <div className="absolute inset-0 w-full h-full border border-[#8be0b7]/10 rounded-full scale-125 blur-sm pointer-events-none animate-pulse" />
                
                <span className="text-6xl sm:text-7xl font-black tracking-tighter text-[#8be0b7] drop-shadow-[0_0_20px_rgba(139,224,183,0.5)]">
                  04
                </span>
                <span className="text-2xl font-extrabold text-neutral-600">/</span>
                <span className="text-3xl font-black text-neutral-400">10</span>
              </div>
              
              <span className="text-[10px] font-extrabold text-[#8be0b7] uppercase tracking-wider font-mono px-3.5 py-1.5 rounded-full bg-[#6fc59b]/15 border border-[#8be0b7]/30 mb-5 animate-pulse shadow-[0_0_15px_rgba(111,197,155,0.15)] flex items-center gap-1">
                <span>🔥</span> slots remaining
              </span>

              {/* Progress info & bar */}
              <div className="w-full space-y-2.5 pt-3.5 border-t border-white/[0.06]">
                <div className="flex justify-between text-[10px] font-mono font-bold">
                  <span className="text-neutral-400">6 Claimed</span>
                  <span className="text-[#8be0b7]">4 Available</span>
                </div>
                <div className="w-full h-2 bg-white/[0.04] rounded-full overflow-hidden border border-white/[0.06]">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "60%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[#8be0b7] to-[#48a877] rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tiers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {TIERS.map((tier, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={`wd-glass-card p-8 sm:p-10 flex flex-col justify-between relative transition-all duration-300 ${tier.popular
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
                <div className="flex flex-col gap-2.5 my-4 pb-4 border-b border-white/[0.08]">
                  <div className="flex items-baseline gap-2.5 flex-wrap">
                    <span
                      className={`text-3xl sm:text-4xl font-black tracking-tight ${tier.popular ? "text-[#8be0b7]" : "text-white"
                        }`}
                    >
                      {tier.price}
                    </span>
                    {tier.originalPrice && (
                      <span className="text-sm sm:text-base font-bold text-neutral-400 line-through decoration-neutral-500/80 decoration-2">
                        {tier.originalPrice}
                      </span>
                    )}
                  </div>
                  <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#6fc59b]/10 border border-[#6fc59b]/25 text-[9px] sm:text-[10px] font-mono font-black text-[#8be0b7] uppercase tracking-wider w-fit">
                    25% launch promo price
                  </div>
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
                  `Hi BizRavana! I would like to lock in the 25% launch promo for the ${tier.name} package (Promo: ${tier.price}, Normal: ${tier.originalPrice}) for my website.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full text-center py-3.5 rounded-full font-bold text-xs transition-all flex items-center justify-center gap-2 ${tier.popular
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
