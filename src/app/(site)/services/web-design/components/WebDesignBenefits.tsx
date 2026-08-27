"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { Sparkles, ArrowRight, ArrowUpRight, Layers, Zap, ShieldCheck, Flame } from "lucide-react";

// Reusable FadeIn Motion Wrapper
function FadeIn({
  children,
  delay = 0,
  duration = 0.7,
  x = 0,
  y = 30,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  x?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "50px", amount: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Character-by-character scroll-driven opacity reveal animation
function AnimatedParagraph({ text }: { text: string }) {
  const containerRef = useRef<HTMLParagraphElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.85", "end 0.35"],
  });

  const words = text.split(" ");
  let charCounter = 0;
  const totalChars = text.length;

  return (
    <p
      ref={containerRef}
      className="font-medium text-center leading-relaxed max-w-[620px] mx-auto text-[#D7E2EA] font-kanit flex flex-wrap justify-center select-none"
      style={{ fontSize: "clamp(1.1rem, 2.2vw, 1.45rem)" }}
    >
      {words.map((word, wIdx) => {
        return (
          <span key={`w-${wIdx}`} className="inline-block whitespace-nowrap mr-[0.3em]">
            {word.split("").map((char, cIdx) => {
              const charIndex = charCounter++;
              const start = charIndex / totalChars;
              const end = start + 1 / totalChars;
              return (
                <AnimatedCharacter
                  key={`c-${wIdx}-${cIdx}`}
                  char={char}
                  range={[start, end]}
                  progress={scrollYProgress}
                />
              );
            })}
          </span>
        );
      })}
    </p>
  );
}

function AnimatedCharacter({
  char,
  range,
  progress,
}: {
  char: string;
  range: [number, number];
  progress: MotionValue<number>;
}) {
  const opacity = useTransform(progress, range, [0.2, 1]);

  return (
    <motion.span style={{ opacity }} className="transition-colors duration-150">
      {char}
    </motion.span>
  );
}

const SERVICES_LIST = [
  {
    number: "01",
    name: "Web Design & Development",
    description:
      "We build fast, clean, and beautiful websites that look great on all phones and computers. Designed to make your business look professional and turn visitors into paying customers.",
    href: "#pricing",
    linkText: "View Packages",
  },
  {
    number: "02",
    name: "Custom ORM & CRM",
    description:
      "Custom order and customer management systems tailored for your business. Track customer records, manage incoming orders, and keep all your sales organized in one place.",
    href: "/services/custom-crm",
    linkText: "Learn More",
  },
  {
    number: "03",
    name: "AI Chatbots",
    description:
      "Smart 24/7 chat assistants for your website and WhatsApp. They answer customer questions instantly, recommend products, and collect orders even while you sleep.",
    href: "/services/ai-chatbots",
    linkText: "Learn More",
  },
  {
    number: "04",
    name: "Automations",
    description:
      "Put repetitive daily tasks on autopilot. We connect your tools to automatically send WhatsApp receipts, generate invoices, and notify your team with zero manual work.",
    href: "/services/ai-automations",
    linkText: "Explore Automations",
  },
  {
    number: "05",
    name: "BizRavana OMS",
    description:
      "Our all-in-one order, inventory, expense, and courier management software for retail and online shops. Connect Royal Express & Koombiyo and track daily profit easily.",
    href: "/services/bizravana-oms",
    linkText: "Explore Platform →",
    highlight: true,
  },
  {
    number: "06",
    name: "Brand Identity Design",
    description:
      "Give your business a memorable, professional look. We design distinctive logos, color palettes, typography, and branded materials that help you stand out from competitors.",
    href: "/services/brand-identity",
    linkText: "Learn More",
  },
];

export default function WebDesignBenefits() {
  return (
    <div className="relative">
      {/* ── 3. ABOUT SECTION (Dark Background #0C0C0C) ───────────────────────── */}
      <section className="relative min-h-[90vh] lg:min-h-screen bg-[#0C0C0C] text-white px-5 sm:px-8 md:px-10 py-20 sm:py-28 flex flex-col justify-center items-center overflow-hidden">
        
        {/* Subtle Ambient Red/Coral Glow in Center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#fd3a25]/6 rounded-full blur-[160px] pointer-events-none -z-0" />

        {/* Four Decorative Floating Accents in Corners */}
        {/* Top-Left Accent */}
        <FadeIn
          delay={0.1}
          x={-80}
          y={0}
          duration={0.9}
          className="absolute top-[5%] left-[2%] sm:left-[4%] md:left-[6%] hidden sm:block pointer-events-none z-10"
        >
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#fd3a25] to-[#ff8a7a] flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Design Standard</p>
              <p className="text-xs font-bold font-kanit text-white">Pixel-Perfect Luxury</p>
            </div>
          </div>
        </FadeIn>

        {/* Top-Right Accent */}
        <FadeIn
          delay={0.15}
          x={80}
          y={0}
          duration={0.9}
          className="absolute top-[5%] right-[2%] sm:right-[4%] md:right-[6%] hidden sm:block pointer-events-none z-10"
        >
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#b31f10] to-[#fd3a25] flex items-center justify-center text-white">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Engineered Speed</p>
              <p className="text-xs font-bold font-kanit text-white">Sub-Second Load</p>
            </div>
          </div>
        </FadeIn>

        {/* Bottom-Left Accent */}
        <FadeIn
          delay={0.25}
          x={-80}
          y={0}
          duration={0.9}
          className="absolute bottom-[6%] left-[3%] sm:left-[6%] md:left-[8%] hidden sm:block pointer-events-none z-10"
        >
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-[#ff6b57]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Next.js Core</p>
              <p className="text-xs font-bold font-kanit text-white">Zero Template Bloat</p>
            </div>
          </div>
        </FadeIn>

        {/* Bottom-Right Accent */}
        <FadeIn
          delay={0.3}
          x={80}
          y={0}
          duration={0.9}
          className="absolute bottom-[6%] right-[3%] sm:right-[6%] md:right-[8%] hidden sm:block pointer-events-none z-10"
        >
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#fd3a25]/20 flex items-center justify-center text-[#fd3a25]">
              <Flame className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Conversion Focus</p>
              <p className="text-xs font-bold font-kanit text-white">WhatsApp & Inquiries</p>
            </div>
          </div>
        </FadeIn>

        {/* Section Header & Manifesto */}
        <div className="wd-container max-w-6xl mx-auto relative z-20 flex flex-col items-center text-center">
          {/* Badge */}
          <FadeIn delay={0} y={20}>
            <div className="wd-badge-mono mb-6 sm:mb-8">
              <Sparkles className="w-3.5 h-3.5 text-[#ff6b57]" />
              <span>[ MORE THAN A WEBSITE ]</span>
            </div>
          </FadeIn>

          {/* Heading */}
          <FadeIn delay={0.05} y={35}>
            <h2
              className="hero-heading font-kanit font-black uppercase leading-none tracking-tight text-center select-none mb-10 sm:mb-14 md:mb-16"
              style={{ fontSize: "clamp(2.8rem, 11vw, 150px)" }}
            >
              ABOUT US
            </h2>
          </FadeIn>

          {/* Animated Paragraph with character-by-character reveal */}
          <div className="mb-14 sm:mb-18 md:mb-20 px-2 max-w-3xl mx-auto">
            <AnimatedParagraph text="With more than five years of experience in craft, we focus on high-converting websites, branding, and seamless user experiences. We truly enjoy partnering with businesses that aim to stand out, command authority, and present their absolute best image. Let's build something incredible together!" />
          </div>

          {/* Contact Button */}
          <FadeIn delay={0.2} y={25}>
            <a
              href="#contact"
              className="wd-contact-pill-btn px-8 py-3.5 sm:px-10 sm:py-4 md:px-12 md:py-4.5 text-xs sm:text-sm md:text-base group"
            >
              <span className="flex items-center gap-2.5">
                <span>Start Your Project</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ── 4. SERVICES SECTION (White Background #FFFFFF) ──────────────────── */}
      <section className="relative bg-[#FFFFFF] text-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32 z-10 shadow-[0_-25px_60px_rgba(0,0,0,0.3)]">
        <div className="wd-container max-w-6xl mx-auto">
          
          {/* Section Heading */}
          <FadeIn delay={0} y={30}>
            <div className="text-center mb-16 sm:mb-20 md:mb-24">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/5 border border-black/10 text-[11px] font-mono font-bold text-neutral-800 uppercase tracking-widest mb-4">
                <Layers className="w-3.5 h-3.5 text-[#fd3a25]" />
                <span>Our Capabilities</span>
              </div>
              <h2
                className="font-kanit font-black uppercase text-[#0C0C0C] leading-none tracking-tight text-center"
                style={{ fontSize: "clamp(2.8rem, 11vw, 150px)" }}
              >
                SERVICES
              </h2>
            </div>
          </FadeIn>

          {/* 6 Service items list */}
          <div className="divide-y divide-[rgba(12,12,12,0.15)] border-t border-b border-[rgba(12,12,12,0.15)]">
            {SERVICES_LIST.map((item, idx) => (
              <FadeIn key={item.number} delay={idx * 0.08} y={25}>
                <div className={`py-8 sm:py-10 md:py-12 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 group hover:bg-neutral-50/90 -mx-4 px-4 sm:-mx-6 sm:px-6 rounded-2xl transition-all duration-300 ${item.highlight ? "bg-neutral-50/60" : ""}`}>
                  
                  {/* Left: Giant Number */}
                  <span
                    className="font-kanit font-black text-[#0C0C0C] select-none leading-none flex-shrink-0 group-hover:text-[#fd3a25] transition-colors duration-300"
                    style={{ fontSize: "clamp(2.8rem, 7vw, 110px)" }}
                  >
                    {item.number}
                  </span>

                  {/* Middle: Name & Description Stacked */}
                  <div className="flex-1 space-y-2 md:space-y-2.5">
                    <div className="flex items-center gap-3">
                      <h3
                        className="font-kanit font-bold uppercase text-[#0C0C0C] tracking-tight group-hover:translate-x-1 transition-transform duration-300"
                        style={{ fontSize: "clamp(1.1rem, 2.2vw, 1.85rem)" }}
                      >
                        {item.name}
                      </h3>
                      {item.highlight && (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#fd3a25]/10 text-[#fd3a25] border border-[#fd3a25]/25 text-[10px] font-mono font-bold uppercase tracking-wider">
                          Flagship Platform
                        </span>
                      )}
                    </div>
                    <p
                      className="text-neutral-700 leading-relaxed max-w-2xl font-normal opacity-85 group-hover:opacity-100 transition-opacity"
                      style={{ fontSize: "clamp(0.9rem, 1.4vw, 1.1rem)" }}
                    >
                      {item.description}
                    </p>
                  </div>

                  {/* Right: Action Link */}
                  {item.href && (
                    <div className="flex-shrink-0 pt-2 md:pt-0">
                      {item.href.startsWith("#") ? (
                        <a
                          href={item.href}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                            item.highlight
                              ? "bg-[#fd3a25] text-white hover:bg-[#d42c1a] shadow-md shadow-[#fd3a25]/25"
                              : "bg-black/5 hover:bg-black/10 text-neutral-800 border border-black/10"
                          }`}
                        >
                          <span>{item.linkText}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <Link
                          href={item.href}
                          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-mono font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer ${
                            item.highlight
                              ? "bg-[#fd3a25] text-white hover:bg-[#d42c1a] shadow-md shadow-[#fd3a25]/25 hover:scale-105"
                              : "bg-black/5 hover:bg-black/10 text-neutral-800 border border-black/10"
                          }`}
                        >
                          <span>{item.linkText}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  )}

                </div>
              </FadeIn>
            ))}
          </div>

        </div>
      </section>
    </div>
  );
}
