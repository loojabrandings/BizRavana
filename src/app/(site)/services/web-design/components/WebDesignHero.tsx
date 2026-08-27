"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";

// Custom Typewriter Hook with configurable speed & delay
function useTypewriter(text: string, speed = 35, startDelay = 400) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed("");
    setDone(false);

    const timeout = setTimeout(() => {
      let i = 0;
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          setDone(true);
          clearInterval(interval);
        }
      }, speed);

      return () => clearInterval(interval);
    }, startDelay);

    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

export default function WebDesignHero() {
  // Full Headline to Type Out
  const headlineText = "YOUR BUSINESS\nDESERVES MORE THAN\nA FACEBOOK PAGE.";
  const { displayed, done } = useTypewriter(headlineText, 32, 400);

  return (
    <section className="relative min-h-[850px] lg:min-h-[900px] pt-36 pb-20 lg:pt-44 lg:pb-28 overflow-hidden bg-[#0C0C0C] text-white flex flex-col justify-center">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-[#fd3a25]/6 rounded-full blur-[160px] pointer-events-none -z-0" />
      <div className="absolute top-1/4 left-1/4 w-[450px] h-[450px] bg-[#ff6b57]/4 rounded-full blur-[160px] pointer-events-none -z-0" />

      {/* Content Container */}
      <div className="wd-container max-w-6xl mx-auto relative z-10 w-full py-8">
        
        {/* Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="wd-badge-mono mb-6"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#ff6b57]" />
          <span>[ BESPOKE WEB ARCHITECTURE ]</span>
        </motion.div>

        {/* Dynamic Typewriter Headline with Kanit & Gradient Styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1
            className="font-kanit font-black uppercase text-white tracking-tight leading-[1.02] select-none whitespace-pre-wrap"
            style={{ fontSize: "clamp(2.6rem, 6vw, 5.4rem)" }}
          >
            {displayed.includes("DESERVES MORE THAN") ? (
              <>
                <span>YOUR BUSINESS</span>
                <br />
                <span className="hero-heading">
                  {displayed.includes("A FACEBOOK PAGE.")
                    ? "DESERVES MORE THAN"
                    : displayed.slice("YOUR BUSINESS\n".length)}
                </span>
                {displayed.includes("A FACEBOOK PAGE.") && (
                  <>
                    <br />
                    <span className="hero-heading-accent">
                      {displayed.slice(
                        "YOUR BUSINESS\nDESERVES MORE THAN\n".length
                      )}
                    </span>
                  </>
                )}
              </>
            ) : (
              <span>{displayed}</span>
            )}
            
            {/* Blinking Cursor while typing */}
            {!done && (
              <span className="inline-block w-[4px] h-[0.9em] bg-[#fd3a25] align-middle ml-2 animate-blink" />
            )}
          </h1>
        </motion.div>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-base sm:text-lg text-neutral-300 max-w-2xl font-normal leading-relaxed mb-10 font-kanit font-light"
        >
          We engineer sub-second, conversion-focused websites for ambitious Sri
          Lankan businesses that want to command authority, reach more high-value
          clients, and scale revenue.
        </motion.p>

        {/* Primary CTA Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap items-center gap-4 pt-2"
        >
          <a
            href="#pricing"
            className="wd-contact-pill-btn px-8 py-3.5 sm:px-10 sm:py-4 text-xs sm:text-sm md:text-base group"
          >
            <span className="flex items-center gap-2">
              <span>Get Started Now</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </span>
          </a>

          <a
            href="#showcase"
            className="wd-ghost-pill-btn px-7 py-3.5 text-xs sm:text-sm tracking-widest"
          >
            View Our Work
          </a>
        </motion.div>

        {/* Small Trust Line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center gap-3 text-xs font-mono text-neutral-400"
        >
          <span className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10">
            Mobile-First
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10">
            Sub-Second Load
          </span>
          <span className="px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10">
            Zero Template Bloat
          </span>
        </motion.div>

      </div>
    </section>
  );
}
