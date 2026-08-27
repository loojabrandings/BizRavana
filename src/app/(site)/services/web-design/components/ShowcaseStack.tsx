"use client";

import { useRef, useState } from "react";
import { motion, useScroll, useTransform, MotionValue, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2, ChevronRight, X } from "lucide-react";

interface ProjectItem {
  number: string;
  title: string;
  category: string;
  type: string;
  subtitle: string;
  url: string;
  image: string;
  tags: string[];
  caseStudy: {
    challenge: string;
    solution: string;
    builtFor: string[];
    metrics: string[];
  };
}

const PROJECTS_DATA: ProjectItem[] = [
  {
    number: "01",
    title: "Art of Frames",
    category: "E-Commerce",
    type: "Client Showcase",
    subtitle: "Personalized Gifts & Custom Wall Art Atelier",
    url: "https://artofframes.netlify.app/",
    image: "/images/web-design/artofframes-preview.png",
    tags: ["Product Customizer", "WhatsApp Checkout", "Sub-Second Load"],
    caseStudy: {
      challenge:
        "Art of Frames needed an elevated digital showroom to present handcrafted personalized gifts, custom engravings, and photo frames with direct instant customer ordering.",
      solution:
        "Engineered a visual-first catalog with interactive product variations, multi-category galleries, and automated WhatsApp cart dispatch for frictionless buyer conversion.",
      builtFor: ["Visual Product Catalog", "1-Click WhatsApp Ordering", "Mobile Fluid Performance"],
      metrics: ["< 0.8s Page Load", "+65% WhatsApp Inquiries", "100% Mobile Responsive"],
    },
  },
  {
    number: "02",
    title: "Cafe Vibe",
    category: "Restaurant & Hospitality",
    type: "Client Showcase",
    subtitle: "Culinary Menu Experience & Table Reservations",
    url: "https://cafevibebg.vercel.app/",
    image: "/images/web-design/cafevibe-preview.png",
    tags: ["Interactive Menu", "Table Booking", "Local SEO"],
    caseStudy: {
      challenge:
        "Cafe Vibe required a modern, appetizing web experience to replace static paper menus, spotlight signature drinks and food items, and facilitate effortless table reservations.",
      solution:
        "Built a responsive culinary destination with categorized food highlights, opening hours, Google Maps routing, and one-tap WhatsApp reservation triggers.",
      builtFor: ["Interactive Menu Showcase", "Table Reservations", "Local Search Optimization"],
      metrics: ["3x Faster Menu Browsing", "Instant WhatsApp Table Booking", "High Social Conversion"],
    },
  },
  {
    number: "03",
    title: "BizRavana OMS",
    category: "SaaS Platform",
    type: "Flagship Software",
    subtitle: "Multi-Tenant Business Operations & Order Suite",
    url: "https://bizravana.com/",
    image: "/images/web-design/bizravana-preview.png",
    tags: ["Order Management", "Live Analytics", "Courier Dispatch"],
    caseStudy: {
      challenge:
        "Growing retail businesses struggled with manual spreadsheets, scattered messaging channels, and delayed order tracking across couriers.",
      solution:
        "Designed and engineered a high-octane SaaS suite uniting orders, expenses, inventory, automated courier API dispatch, and live P&L reporting.",
      builtFor: ["Order Lifecycle Hub", "Inventory Synchronization", "Automated Courier Routing"],
      metrics: ["10k+ Monthly Orders", "Real-Time Tracking", "Enterprise Security"],
    },
  },
];

export default function ShowcaseStack() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  return (
    <section
      id="showcase"
      ref={containerRef}
      className="relative bg-[#0C0C0C] rounded-t-[40px] sm:rounded-t-[50px] md:rounded-t-[60px] -mt-10 sm:-mt-12 md:-mt-14 z-20 pt-20 sm:pt-28 pb-32 border-t border-white/[0.08]"
    >
      {/* Background glow */}
      <div className="absolute top-40 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-[#fd3a25]/5 rounded-full blur-[180px] pointer-events-none -z-0" />

      <div className="wd-container max-w-6xl mx-auto mb-16 sm:mb-20">
        {/* Section Header */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="wd-badge-mono">
            <span className="wd-dot-pulse" />
            <span>[ PROVEN TRACK RECORD ]</span>
          </div>

          <h2
            className="hero-heading font-kanit font-black uppercase leading-none tracking-tight text-center select-none"
            style={{ fontSize: "clamp(2.8rem, 11vw, 150px)" }}
          >
            PROJECTS
          </h2>

          <p className="text-neutral-400 max-w-xl text-sm sm:text-base leading-relaxed font-kanit">
            Explore bespoke digital flagships engineered for industry leaders. Every project is crafted for sub-second velocity, visual authority, and uncompromising conversion.
          </p>
        </div>
      </div>

      {/* ── Sticky Stacking Project Cards Container ──────────────────────────── */}
      <div className="wd-container max-w-6xl mx-auto relative">
        {PROJECTS_DATA.map((project, idx) => {
          const targetScale = 1 - (PROJECTS_DATA.length - 1 - idx) * 0.04;
          return (
            <StickyProjectCard
              key={project.number}
              project={project}
              index={idx}
              totalCards={PROJECTS_DATA.length}
              targetScale={targetScale}
              progress={scrollYProgress}
            />
          );
        })}
      </div>

      {/* ── Bottom Portfolio Link CTA ────────────────────────────────────────── */}
      <div className="wd-container max-w-4xl mx-auto mt-24 sm:mt-32 text-center pt-12 border-t border-white/[0.06]">
        <div className="space-y-3 mb-8">
          <span className="text-xs font-mono text-[#ff8a7a] uppercase tracking-widest font-bold">
            Looking for something tailored to your industry?
          </span>
          <h3 className="text-2xl sm:text-4xl font-extrabold text-white font-kanit tracking-tight">
            Explore All 10+ Live Industry Demos
          </h3>
          <p className="text-sm sm:text-base text-neutral-400 max-w-lg mx-auto">
            From High-Energy Gyms to Luxury Jewellers, Healthcare Clinics, Hotels & Spas.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/portfolio"
            className="wd-contact-pill-btn px-8 py-3.5 sm:px-10 sm:py-4 text-xs sm:text-sm md:text-base"
          >
            <span className="flex items-center gap-2">
              <span>View All Demos & Portfolio</span>
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </Link>
          <a
            href="#pricing"
            className="wd-ghost-pill-btn px-8 py-3.5 sm:px-10 sm:py-4 text-xs sm:text-sm md:text-base"
          >
            View Pricing Tiers
          </a>
        </div>
      </div>
    </section>
  );
}

function StickyProjectCard({
  project,
  index,
  totalCards,
  targetScale,
  progress,
}: {
  project: ProjectItem;
  index: number;
  totalCards: number;
  targetScale: number;
  progress: MotionValue<number>;
}) {
  const cardContainerRef = useRef<HTMLDivElement | null>(null);
  const [isCaseStudyOpen, setIsCaseStudyOpen] = useState(false);

  // Each card scales down as subsequent cards scroll over it
  const rangeStart = index * (1 / totalCards);
  const scale = useTransform(progress, [rangeStart, 1], [1, targetScale]);

  return (
    <div
      ref={cardContainerRef}
      className="min-h-[85vh] md:min-h-[95vh] h-auto py-4 sm:py-6 flex items-center justify-center sticky top-16 sm:top-20 md:top-24"
      style={{
        top: `calc(65px + ${index * 28}px)`,
      }}
    >
      <motion.div
        style={{
          scale,
        }}
        className="w-full origin-top rounded-[32px] sm:rounded-[44px] md:rounded-[52px] border-2 border-[#D7E2EA] bg-[#0C0C0C] shadow-[0_35px_80px_rgba(0,0,0,0.95)] relative overflow-hidden transition-colors duration-500 hover:border-[#ffffff]"
      >
        {/* Subtle Ambient Red Tint inside Card */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-[#fd3a25]/5 rounded-full blur-[100px] pointer-events-none" />

        {/* ── TOP ROW: Number, Category, Name & Ghost Live Project Button ──── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-5 sm:px-8 md:px-10 pt-5 sm:pt-7 pb-5 sm:pb-6 border-b border-white/[0.1]">
          {/* Left: Giant Number + Title info */}
          <div className="flex items-center gap-4 sm:gap-6">
            <span
              className="font-kanit font-black text-white leading-none select-none tracking-tighter"
              style={{ fontSize: "clamp(2.5rem, 6vw, 90px)" }}
            >
              {project.number}
            </span>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] sm:text-xs font-mono text-[#D7E2EA] uppercase tracking-wider font-semibold">
                  {project.category}
                </span>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest hidden sm:inline">
                  • {project.type}
                </span>
              </div>
              <h3
                className="font-kanit font-black uppercase text-white tracking-tight leading-tight"
                style={{ fontSize: "clamp(1.3rem, 2.8vw, 2.4rem)" }}
              >
                {project.title}
              </h3>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap md:flex-nowrap">
            <button
              onClick={() => setIsCaseStudyOpen((prev) => !prev)}
              className={`px-5 sm:px-6 py-2.5 sm:py-3 rounded-full border transition-all cursor-pointer flex items-center gap-1.5 text-xs sm:text-sm font-kanit font-medium uppercase tracking-wider ${
                isCaseStudyOpen
                  ? "bg-[#fd3a25] border-[#fd3a25] text-white shadow-lg shadow-[#fd3a25]/30"
                  : "border-white/20 hover:border-white/40 bg-white/[0.04] hover:bg-white/10 text-white"
              }`}
            >
              <span>{isCaseStudyOpen ? "← Back to Preview" : "Case Study"}</span>
              {isCaseStudyOpen ? (
                <X className="w-3.5 h-3.5 text-white" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              )}
            </button>

            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="wd-ghost-pill-btn px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm tracking-widest flex items-center gap-2"
            >
              <span>Live Project</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* ── BOTTOM: Exact 16:9 Unclipped Hero Image Showcase with Frosted Glass Case Study Overlay ── */}
        <div className="relative w-full aspect-[16/9] bg-[#16171f] group/hero overflow-hidden">
          <Image
            src={project.image}
            alt={`${project.title} flagship hero preview`}
            fill
            sizes="(max-width: 1200px) 100vw, 1200px"
            className="object-cover object-top transition-transform duration-700 ease-out group-hover/hero:scale-105"
            priority={index === 0}
          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />

          {/* Tags overlay at bottom (visible when case study is closed) */}
          {!isCaseStudyOpen && (
            <div className="absolute bottom-5 sm:bottom-7 left-6 sm:left-8 right-6 sm:right-8 flex flex-wrap gap-2 z-10 pointer-events-none">
              {project.tags.map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/15 text-[10px] sm:text-xs font-mono text-white tracking-wide uppercase font-semibold"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* ── FROSTED GLASS IN-CARD CASE STUDY OVERLAY ── */}
          <AnimatePresence>
            {isCaseStudyOpen && (
              <motion.div
                initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
                exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                transition={{ duration: 0.35, ease: "easeInOut" }}
                className="absolute inset-0 bg-black/80 sm:bg-black/85 backdrop-blur-xl z-20 p-5 sm:p-8 md:p-10 flex flex-col justify-between overflow-y-auto"
              >
                {/* Ambient Red Radial Glow */}
                <div className="absolute top-0 right-1/4 w-80 h-80 bg-[#fd3a25]/15 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 space-y-4 sm:space-y-6 my-auto max-w-4xl mx-auto w-full">
                  {/* Top Bar inside Glass Overlay */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fd3a25]/15 border border-[#fd3a25]/30 text-[10px] sm:text-xs font-mono font-bold text-[#ff8a7a] uppercase tracking-wider">
                      Case Study — {project.title}
                    </span>
                    <span className="text-[11px] sm:text-xs font-mono text-neutral-400 uppercase tracking-widest hidden sm:inline">
                      {project.subtitle}
                    </span>
                  </div>

                  {/* Challenge & Solution Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-1.5">
                      <h4 className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-[#ff8a7a]">
                        The Challenge
                      </h4>
                      <p className="text-neutral-200 leading-relaxed font-light">
                        {project.caseStudy.challenge}
                      </p>
                    </div>

                    <div className="p-4 sm:p-5 rounded-2xl bg-white/[0.04] border border-white/[0.08] space-y-1.5">
                      <h4 className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-[#ff8a7a]">
                        Our Solution
                      </h4>
                      <p className="text-neutral-200 leading-relaxed font-light">
                        {project.caseStudy.solution}
                      </p>
                    </div>
                  </div>

                  {/* Built For & Metrics */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 sm:pt-4 border-t border-white/10">
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">
                        Core Architecture
                      </span>
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        {project.caseStudy.builtFor.map((feat, fIdx) => (
                          <span
                            key={fIdx}
                            className="px-2.5 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] sm:text-xs font-mono text-neutral-300"
                          >
                            {feat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-400 font-bold block">
                        Verified Impact
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {project.caseStudy.metrics.map((metric, mIdx) => (
                          <span
                            key={mIdx}
                            className="px-3 py-1 rounded-full bg-[#fd3a25]/20 border border-[#fd3a25]/30 text-[10px] sm:text-xs font-kanit font-bold text-white flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#ff8a7a]" />
                            <span>{metric}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </motion.div>
    </div>
  );
}
