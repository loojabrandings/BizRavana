"use client";

import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function FinalCta() {
  const readyMsg = "Hi BizRavana! I am ready to start my website project.";

  return (
    <section className="py-32 lg:py-40 relative bg-[#040406] overflow-hidden text-center">
      {/* Cinematic Ambient Radial Green Energy Flare */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[1000px] h-[450px] bg-gradient-to-r from-[#fd3a25]/12 via-[#d42c1a]/15 to-[#ff6b57]/12 rounded-full blur-[150px] pointer-events-none -z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(#fd3a25_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.04] pointer-events-none" />

      {/* Floating browser-window line-art mockup in background to frame the content */}
      <div className="absolute top-[48%] left-1/2 -translate-x-1/2 w-full max-w-4xl h-[460px] border border-white/[0.04] bg-white/[0.01] rounded-3xl pointer-events-none -z-10 shadow-[0_30px_100px_rgba(0,0,0,0.8)] backdrop-blur-[1px] hidden sm:block">
        {/* Browser control header */}
        <div className="w-full h-9 border-b border-white/[0.04] flex items-center gap-1.5 px-4">
          <span className="w-2 h-2 rounded-full bg-white/[0.12]" />
          <span className="w-2 h-2 rounded-full bg-white/[0.12]" />
          <span className="w-2 h-2 rounded-full bg-white/[0.12]" />
        </div>
      </div>

      <div className="wd-container max-w-5xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col items-center max-w-3xl mx-auto"
        >
          {/* Eyebrow Label */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-mono text-neutral-400 font-bold tracking-widest uppercase mb-8 shadow-sm">
            LET&apos;S BUILD SOMETHING GREAT
          </div>

          {/* Headline */}
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[1.08] mb-6">
            Your Next Customer <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ff8a7a] to-[#fd3a25] drop-shadow-[0_0_30px_rgba(253, 58, 37, 0.3)]">
              Could Be One Click Away.
            </span>
          </h2>

          {/* Description Sub-copy */}
          <p className="text-sm sm:text-lg text-neutral-300 font-normal leading-relaxed mb-10 max-w-2xl">
            Ready to take your business beyond social media? Let&apos;s create a website that gives your brand the professional online presence it deserves.
          </p>

          {/* Action Buttons (High intent CTA layout) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
            {/* Primary High-Intent Button */}
            <a
              href={`https://wa.me/94750350109?text=${encodeURIComponent(readyMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto flex-1 px-9 py-4 rounded-full bg-gradient-to-r from-[#ff6b57] via-[#fd3a25] to-[#d42c1a] hover:from-[#ff8a7a] hover:to-[#e8321e] text-[#060201] font-black text-sm tracking-wide shadow-[0_8px_30px_rgba(111,197,155,0.4)] hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer group/btn"
            >
              <span>Start Your Website</span>
              <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
            </a>

            {/* Secondary Helpline Button */}
            <a
              href="https://wa.me/94750350109"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 hover:border-[#fd3a25]/40 text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all duration-300 hover:scale-102 cursor-pointer shadow-lg"
            >
              Chat on WhatsApp
            </a>
          </div>

          {/* Friction-reducing Micro-copy */}
          <span className="text-[10px] sm:text-xs font-mono text-neutral-500 uppercase tracking-widest mt-8 font-bold select-none">
            Free consultation &bull; No obligation &bull; Clear pricing
          </span>

        </motion.div>
      </div>
    </section>
  );
}
