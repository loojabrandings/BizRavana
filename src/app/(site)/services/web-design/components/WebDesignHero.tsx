"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
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
  const sectionRef = useRef<HTMLElement>(null);
  const headlineText = "YOUR BUSINESS\nDESERVES MORE THAN\nA FACEBOOK PAGE.";
  const { displayed, done } = useTypewriter(headlineText, 32, 400);

  // Strong scroll-driven parallax progress binding
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 24,
    restDelta: 0.001,
  });

  // Layer 1: Ambient Parallax Flare Glow
  const glowY = useTransform(smoothProgress, [0, 1], [0, 220]);
  const glowScale = useTransform(smoothProgress, [0, 1], [1, 1.5]);
  const secondaryGlowY = useTransform(smoothProgress, [0, 1], [0, 140]);

  // Layer 2: Badge & Headline Parallax Displacement + Perspective Scale
  const headlineY = useTransform(smoothProgress, [0, 1], [0, 160]);
  const headlineScale = useTransform(smoothProgress, [0, 1], [1, 0.92]);
  const headlineOpacity = useTransform(smoothProgress, [0, 0.75, 1], [1, 0.7, 0.1]);

  // Layer 3: Subtitle Parallax
  const subY = useTransform(smoothProgress, [0, 1], [0, 190]);
  const subOpacity = useTransform(smoothProgress, [0, 0.65, 1], [1, 0.6, 0]);

  // Layer 4: Action Buttons Parallax
  const ctaY = useTransform(smoothProgress, [0, 1], [0, 110]);
  const ctaScale = useTransform(smoothProgress, [0, 1], [1, 0.95]);

  // Layer 5: Bottom Trust Bar
  const trustY = useTransform(smoothProgress, [0, 1], [0, 80]);
  const trustOpacity = useTransform(smoothProgress, [0, 0.5, 1], [1, 0.5, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[850px] lg:min-h-[950px] pt-36 pb-20 lg:pt-44 lg:pb-32 overflow-hidden bg-[#0C0C0C] text-white flex flex-col justify-center items-center text-center"
    >
      {/* Layer 1: Background Ambient Glows with Deep Parallax */}
      <motion.div
        style={{ y: glowY, scale: glowScale }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[#fd3a25]/6 rounded-full blur-[170px] pointer-events-none -z-0"
      />
      <motion.div
        style={{ y: secondaryGlowY }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[#ff6b57]/4 rounded-full blur-[160px] pointer-events-none -z-0"
      />

      {/* Content Container (Center Aligned) */}
      <div className="wd-container max-w-5xl mx-auto relative z-10 w-full py-8 flex flex-col items-center text-center">
        
        {/* Layer 2: Pill Badge & Headline */}
        <motion.div
          style={{ y: headlineY, scale: headlineScale, opacity: headlineOpacity }}
          className="w-full flex flex-col items-center"
        >
          {/* Pill Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="wd-badge-mono mb-6"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#ff6b57]" />
            <span>[ CUSTOM WEB ARCHITECTURE ]</span>
          </motion.div>

          {/* Dynamic Typewriter Headline with Kanit & Gradient Styling */}
          <div className="mb-8 w-full max-w-4xl mx-auto">
            <h1
              className="font-kanit font-black uppercase text-white tracking-tight leading-[1.02] select-none whitespace-pre-wrap text-center"
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
          </div>
        </motion.div>

        {/* Layer 3: Subheading with Staggered Parallax Lift */}
        <motion.p
          style={{ y: subY, opacity: subOpacity }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-base sm:text-lg text-neutral-300 max-w-2xl mx-auto font-normal leading-relaxed mb-10 font-kanit font-light text-center"
        >
          We engineer sub-second, conversion-focused websites for ambitious Sri
          Lankan businesses that want to command authority, reach more high-value
          clients, and scale revenue.
        </motion.p>

        {/* Layer 4: Primary CTA Action Buttons with Smooth Parallax Counter-Lift */}
        <motion.div
          style={{ y: ctaY, scale: ctaScale }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-2"
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

        {/* Layer 5: Small Trust Line with Float Parallax */}
        <motion.div
          style={{ y: trustY, opacity: trustOpacity }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-neutral-400"
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
