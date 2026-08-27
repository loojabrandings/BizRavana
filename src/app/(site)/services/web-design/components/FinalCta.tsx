"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

export default function FinalCta() {
  const readyMsg = "Hi BizRavana! I am ready to start my website project.";

  return (
    <section className="py-32 lg:py-40 relative bg-[#0C0C0C] border-t border-white/[0.06] overflow-hidden text-center">
      {/* Ambient Radial Coral Flare */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[450px] bg-gradient-to-r from-[#fd3a25]/10 via-[#d42c1a]/15 to-[#ff6b57]/10 rounded-full blur-[160px] pointer-events-none -z-0" />

      <div className="wd-container max-w-6xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center max-w-3xl mx-auto"
        >
          {/* Eyebrow Label */}
          <div className="wd-badge-mono mb-8">
            <Sparkles className="w-3.5 h-3.5 text-[#ff6b57]" />
            <span>[ READY TO ELEVATE YOUR BRAND? ]</span>
          </div>

          {/* Headline with .hero-heading */}
          <h2
            className="font-kanit font-black uppercase text-white tracking-tight leading-[1.05] mb-8 select-none"
            style={{ fontSize: "clamp(2.6rem, 7vw, 5.2rem)" }}
          >
            YOUR NEXT CLIENT <br />
            <span className="hero-heading">COULD BE ONE</span> <br />
            <span className="hero-heading-accent">CLICK AWAY.</span>
          </h2>

          {/* Description Sub-copy */}
          <p className="text-base sm:text-lg text-neutral-300 font-kanit font-light leading-relaxed mb-10 max-w-2xl">
            Ready to take your business beyond generic social pages? Let&apos;s engineer a high-converting digital presence that commands authority and wins market share.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
            <a
              href={`https://wa.me/94750350109?text=${encodeURIComponent(readyMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="wd-contact-pill-btn px-9 py-4 text-xs sm:text-sm tracking-wider w-full sm:w-auto flex-1 group"
            >
              <span className="flex items-center justify-center gap-2">
                <span>Start Your Website</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </a>

            <a
              href="https://wa.me/94750350109"
              target="_blank"
              rel="noopener noreferrer"
              className="wd-ghost-pill-btn px-8 py-4 text-xs sm:text-sm tracking-widest w-full sm:w-auto"
            >
              Chat on WhatsApp
            </a>
          </div>

          {/* Friction-reducing Micro-copy */}
          <span className="text-[10px] sm:text-xs font-mono text-neutral-400 uppercase tracking-widest mt-10 font-bold select-none">
            Free consultation &bull; No obligation &bull; Clear pricing
          </span>

        </motion.div>
      </div>
    </section>
  );
}
