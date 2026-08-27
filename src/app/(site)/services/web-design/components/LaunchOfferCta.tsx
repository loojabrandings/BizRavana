"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function LaunchOfferCta() {
  const claimMsg = "Hi BizRavana! I would like to claim my launch spot for the Web Design introductory offer.";

  return (
    <section className="py-24 relative bg-[#0C0C0C] border-t border-white/[0.06] overflow-hidden">
      <div className="wd-container max-w-6xl mx-auto relative z-10">
        
        {/* Main Distinct CTA Block Card Wrapper */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="p-8 sm:p-14 rounded-[36px] sm:rounded-[52px] bg-[#0C0C0C] border-2 border-[#D7E2EA]/30 relative overflow-hidden text-center shadow-[0_35px_80px_rgba(0,0,0,0.9)]"
        >
          {/* Ambient background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[300px] bg-[#fd3a25]/8 blur-[140px] rounded-full pointer-events-none -z-0" />

          <div className="relative z-10 flex flex-col items-center">
            
            {/* Pill Badge */}
            <div className="wd-badge-mono mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff6b57] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#fd3a25]"></span>
              </span>
              <span>[ LIMITED LAUNCH OFFER ]</span>
            </div>

            {/* Headline with .hero-heading */}
            <h2
              className="font-kanit font-black uppercase text-white tracking-tight leading-[1.05] mb-5 max-w-2xl select-none"
              style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}
            >
              READY TO GIVE YOUR BRAND A <br />
              <span className="hero-heading">SUPERIOR ONLINE</span> <br />
              <span className="hero-heading-accent">PRESENCE?</span>
            </h2>

            {/* Description */}
            <p className="text-neutral-400 text-xs sm:text-sm md:text-base font-kanit font-light leading-relaxed max-w-2xl mx-auto mb-10 select-none">
              We&apos;re opening a limited number of launch spots for Sri Lankan businesses that want a high-converting website at our special introductory pricing.
            </p>

            {/* Highlight Box */}
            <div className="w-full max-w-md mx-auto p-6 sm:p-7 rounded-[28px] bg-[#120807] border-2 border-[#fd3a25]/40 mb-10 relative overflow-hidden backdrop-blur-md">
              <span className="text-[10px] font-mono text-[#ff8a7a] uppercase tracking-widest mb-1.5 font-bold block select-none">
                Exclusive Opportunity
              </span>
              
              <div className="text-4xl sm:text-5xl font-black font-kanit text-[#ff8a7a] tracking-tight uppercase mb-2 select-none">
                10 LAUNCH SPOTS
              </div>
              
              <div className="text-xs sm:text-sm font-bold font-kanit text-neutral-200 uppercase tracking-widest mb-3 select-none">
                25% Introductory Discount Applied
              </div>
              
              <p className="text-[11px] text-neutral-400 font-kanit font-light leading-normal pt-3 border-t border-white/[0.08] select-none">
                Once these 10 launch spots are filled, standard agency pricing applies.
              </p>
            </div>

            {/* CTA Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md relative z-20">
              <a
                href={`https://wa.me/94750350109?text=${encodeURIComponent(claimMsg)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="wd-contact-pill-btn px-8 py-4 text-xs sm:text-sm tracking-wider w-full sm:w-auto flex-1 group cursor-pointer"
              >
                <span className="flex items-center justify-center gap-2">
                  <span>Claim Your Launch Spot</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </span>
              </a>

              <a
                href="https://wa.me/94750350109"
                target="_blank"
                rel="noopener noreferrer"
                className="wd-ghost-pill-btn px-7 py-4 text-xs sm:text-sm tracking-widest w-full sm:w-auto"
              >
                Chat on WhatsApp
              </a>
            </div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
