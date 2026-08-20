"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function LaunchOfferCta() {
  const claimMsg = "Hi BizRavana! I would like to claim my launch spot for the Web Design introductory offer.";

  return (
    <section className="py-24 relative bg-[#040406] overflow-hidden">
      <div className="wd-container relative z-10">
        
        {/* Main Visually Distinct CTA Block Card Wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl mx-auto p-10 sm:p-14 rounded-[40px] bg-[#0c0f12] border border-[#fd3a25]/25 relative overflow-hidden text-center shadow-[0_30px_80px_rgba(253, 58, 37, 0.06)]"
        >
          {/* Ambient background green glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[300px] bg-[#fd3a25]/8 blur-[130px] rounded-full pointer-events-none -z-0" />
          <div className="absolute inset-0 bg-[radial-gradient(#fd3a25_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.03] pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center">
            
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fd3a25]/10 border border-[#fd3a25]/20 text-[10px] font-mono text-[#ff6b57] font-black tracking-widest uppercase mb-6 shadow-sm select-none">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6b57] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#fd3a25]"></span>
              </span>
              <span>LIMITED LAUNCH OFFER</span>
            </div>

            {/* Headline */}
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-5 max-w-2xl select-none">
              Ready to Give Your Business a <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ff8a7a] to-[#fd3a25] drop-shadow-[0_0_20px_rgba(253, 58, 37, 0.12)]">
                Better Online Presence?
              </span>
            </h2>

            {/* Description */}
            <p className="text-neutral-400 text-xs sm:text-sm md:text-base font-normal leading-relaxed max-w-2xl mx-auto mb-10 select-none">
              We&apos;re opening a limited number of launch spots for Sri Lankan businesses that want a professionally designed website at our introductory pricing.
            </p>

            {/* Visual Pause Centerpiece (Glowing Highlight Box) */}
            <div className="w-full max-w-md mx-auto p-6 sm:p-7 rounded-[24px] bg-black/40 border border-white/[0.06] mb-10 relative overflow-hidden backdrop-blur-md">
              {/* Inner subtle glow */}
              <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-[#fd3a25]/5 via-transparent to-transparent pointer-events-none" />

              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest mb-1.5 font-black block select-none">
                Offer Highlight
              </span>
              
              <div className="text-4xl sm:text-5xl font-black font-mono text-[#ff6b57] tracking-tighter drop-shadow-[0_0_15px_rgba(253, 58, 37, 0.2)] uppercase mb-2 select-none">
                10 LAUNCH SPOTS
              </div>
              
              <div className="text-xs sm:text-sm font-bold text-neutral-200 uppercase tracking-widest mb-4 select-none">
                Special Introductory Pricing
              </div>
              
              <p className="text-[11px] text-neutral-400 font-bold leading-normal pt-3 border-t border-white/[0.05] select-none">
                Once the launch spots are filled, standard pricing applies.
              </p>
            </div>

            {/* CTA Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md relative z-20">
              
              {/* Primary Claim Spot Button */}
              <a
                href={`https://wa.me/94750350109?text=${encodeURIComponent(claimMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto flex-1 px-8 py-4 rounded-full bg-gradient-to-r from-[#ff6b57] via-[#fd3a25] to-[#d42c1a] hover:from-[#ff8a7a] hover:to-[#e8321e] text-[#060201] font-black text-sm tracking-wide shadow-[0_8px_25px_rgba(253, 58, 37, 0.35)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer group/btn"
              >
                <span>Claim Your Launch Spot</span>
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </a>

              {/* Secondary Whatsapp helpline */}
              <a
                href="https://wa.me/94750350109"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-7 py-4 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-[#fd3a25]/40 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:scale-102 cursor-pointer shadow-lg"
              >
                Talk to Us on WhatsApp
              </a>

            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
