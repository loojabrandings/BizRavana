"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useSpring, MotionValue } from "framer-motion";
import { Sparkles, ArrowRight, ArrowUpRight, Layers, Zap, ShieldCheck, Flame } from "lucide-react";

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
      className="font-medium text-center leading-relaxed max-w-[640px] mx-auto text-[#D7E2EA] font-kanit flex flex-wrap justify-center select-none"
      style={{ fontSize: "clamp(1.15rem, 2.2vw, 1.5rem)" }}
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
  const aboutRef = useRef<HTMLElement>(null);
  const servicesRef = useRef<HTMLElement>(null);

  // Parallax bindings for About section
  const { scrollYProgress: aboutProgress } = useScroll({
    target: aboutRef,
    offset: ["start end", "end start"],
  });

  const smoothAbout = useSpring(aboutProgress, {
    stiffness: 90,
    damping: 25,
    restDelta: 0.001,
  });

  const aboutGlowY = useTransform(smoothAbout, [0, 1], [-140, 140]);
  const aboutGlowScale = useTransform(smoothAbout, [0, 0.5, 1], [0.85, 1.3, 0.85]);
  const aboutHeaderY = useTransform(smoothAbout, [0, 1], [60, -60]);
  const aboutParagraphY = useTransform(smoothAbout, [0, 1], [30, -30]);
  const aboutCtaY = useTransform(smoothAbout, [0, 1], [40, -40]);

  // Corner widgets floating parallax
  const tlWidgetY = useTransform(smoothAbout, [0, 1], [-50, 50]);
  const tlWidgetX = useTransform(smoothAbout, [0, 1], [-20, 20]);
  const trWidgetY = useTransform(smoothAbout, [0, 1], [60, -60]);
  const trWidgetX = useTransform(smoothAbout, [0, 1], [25, -25]);
  const blWidgetY = useTransform(smoothAbout, [0, 1], [70, -70]);
  const brWidgetY = useTransform(smoothAbout, [0, 1], [-60, 60]);

  // Parallax bindings for Services Section
  const { scrollYProgress: servicesProgress } = useScroll({
    target: servicesRef,
    offset: ["start end", "end start"],
  });

  const smoothServices = useSpring(servicesProgress, {
    stiffness: 90,
    damping: 25,
    restDelta: 0.001,
  });

  const servicesHeaderY = useTransform(smoothServices, [0, 1], [70, -70]);
  const servicesHeaderScale = useTransform(smoothServices, [0, 0.5, 1], [0.92, 1.03, 0.95]);

  return (
    <div className="relative">
      {/* ── 3. ABOUT SECTION (Dark Background #0C0C0C) ───────────────────────── */}
      <section
        ref={aboutRef}
        className="relative min-h-[90vh] lg:min-h-screen bg-[#0C0C0C] text-white px-5 sm:px-8 md:px-10 py-20 sm:py-28 flex flex-col justify-center items-center overflow-hidden"
      >
        {/* Subtle Ambient Red/Coral Glow with Parallax */}
        <motion.div
          style={{ y: aboutGlowY, scale: aboutGlowScale }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[450px] bg-[#fd3a25]/6 rounded-full blur-[170px] pointer-events-none -z-0"
        />

        {/* Four Decorative Floating Accents in Corners with Strong Multi-Axis Parallax */}
        {/* Top-Left Accent */}
        <motion.div
          style={{ y: tlWidgetY, x: tlWidgetX }}
          className="absolute top-[8%] left-[3%] sm:left-[6%] md:left-[8%] hidden sm:block pointer-events-none z-10"
        >
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#fd3a25]/20 flex items-center justify-center text-[#fd3a25]">
              <Zap className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Performance</p>
              <p className="text-xs font-bold font-kanit text-white">Sub-Second Core</p>
            </div>
          </div>
        </motion.div>

        {/* Top-Right Accent */}
        <motion.div
          style={{ y: trWidgetY, x: trWidgetX }}
          className="absolute top-[10%] right-[3%] sm:right-[6%] md:right-[8%] hidden sm:block pointer-events-none z-10"
        >
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#ff6b57]/20 flex items-center justify-center text-[#ff6b57]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Architecture</p>
              <p className="text-xs font-bold font-kanit text-white">99.9% Uptime SLA</p>
            </div>
          </div>
        </motion.div>

        {/* Bottom-Left Accent */}
        <motion.div
          style={{ y: blWidgetY }}
          className="absolute bottom-[6%] left-[3%] sm:left-[6%] md:left-[8%] hidden sm:block pointer-events-none z-10"
        >
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#fd3a25]/20 flex items-center justify-center text-[#fd3a25]">
              <Layers className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">SEO Engine</p>
              <p className="text-xs font-bold font-kanit text-white">100% Discoverable</p>
            </div>
          </div>
        </motion.div>

        {/* Bottom-Right Accent */}
        <motion.div
          style={{ y: brWidgetY }}
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
        </motion.div>

        {/* Section Header & Manifesto with Parallax Lift */}
        <div className="wd-container max-w-6xl mx-auto relative z-20 flex flex-col items-center text-center">
          {/* Badge & Heading */}
          <motion.div style={{ y: aboutHeaderY }} className="flex flex-col items-center">
            <div className="wd-badge-mono mb-6 sm:mb-8">
              <Sparkles className="w-3.5 h-3.5 text-[#ff6b57]" />
              <span>[ MORE THAN A WEBSITE ]</span>
            </div>

            <h2
              className="hero-heading font-kanit font-black uppercase leading-none tracking-tight text-center select-none mb-10 sm:mb-14 md:mb-16"
              style={{ fontSize: "clamp(2.8rem, 11vw, 150px)" }}
            >
              ABOUT US
            </h2>
          </motion.div>

          {/* Animated Paragraph with character-by-character reveal + Parallax Float */}
          <motion.div style={{ y: aboutParagraphY }} className="mb-14 sm:mb-18 md:mb-20 px-2 max-w-3xl mx-auto">
            <AnimatedParagraph text="With more than five years of experience in craft, we focus on high-converting websites, branding, and seamless user experiences. We truly enjoy partnering with businesses that aim to stand out, command authority, and present their absolute best image. Let's build something incredible together!" />
          </motion.div>

          {/* Contact Button with Parallax Float */}
          <motion.div style={{ y: aboutCtaY }}>
            <a
              href="#contact"
              className="wd-contact-pill-btn px-8 py-3.5 sm:px-10 sm:py-4 md:px-12 md:py-4.5 text-xs sm:text-sm md:text-base group"
            >
              <span className="flex items-center gap-2.5">
                <span>Start Your Project</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── 4. SERVICES SECTION (White Background #FFFFFF) ──────────────────── */}
      <section
        ref={servicesRef}
        className="relative bg-[#FFFFFF] text-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] px-5 sm:px-8 md:px-10 py-20 sm:py-24 md:py-32 z-10 shadow-[0_-25px_60px_rgba(0,0,0,0.3)]"
      >
        <div className="wd-container max-w-6xl mx-auto">
          
          {/* Section Heading with Parallax */}
          <motion.div
            style={{ y: servicesHeaderY, scale: servicesHeaderScale }}
            className="text-center mb-16 sm:mb-20 md:mb-24"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-black/5 border border-black/10 text-[11px] font-mono font-bold text-neutral-800 uppercase tracking-widest mb-4">
              <Layers className="w-3.5 h-3.5 text-[#fd3a25]" />
              <span>Our Capabilities</span>
            </div>
            <h2
              className="font-kanit font-black uppercase text-[#0C0C0C] leading-none tracking-tight text-center select-none"
              style={{ fontSize: "clamp(2.8rem, 11vw, 150px)" }}
            >
              SERVICES
            </h2>
          </motion.div>

          {/* 6 Service items list with Staggered Parallax Wave */}
          <div className="divide-y divide-[rgba(12,12,12,0.15)] border-t border-b border-[rgba(12,12,12,0.15)]">
            {SERVICES_LIST.map((item, idx) => {
              const isOdd = idx % 2 === 0;
              const itemY = isOdd ? 25 : -20;

              return (
                <motion.div
                  key={item.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  className={`py-8 sm:py-10 md:py-12 flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-8 group hover:bg-neutral-50/90 -mx-4 px-4 sm:-mx-6 sm:px-6 rounded-2xl transition-all duration-300 ${
                    item.highlight ? "bg-neutral-50/60" : ""
                  }`}
                >
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
                              ? "bg-[#fd3a25] text-white hover:bg-[#d42c1a] shadow-md shadow-[#fd3a25]/25 hover:scale-105"
                              : "bg-black/5 hover:bg-black/10 text-neutral-800 border border-black/10 hover:border-black/30"
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
                              : "bg-black/5 hover:bg-black/10 text-neutral-800 border border-black/10 hover:border-black/30"
                          }`}
                        >
                          <span>{item.linkText}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

        </div>
      </section>
    </div>
  );
}
