"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

const PROJECTS = [
  {
    title: "Art of Frames",
    url: "https://artofframes.netlify.app/",
    domain: "artofframes.netlify.app",
    image: "/images/web-design/artofframes-preview.png",
    subtitle: "Personalized Gifts & Wall Art",
    tags: ["E-commerce Experience", "Product Showcase", "WhatsApp"],
    caseStudy: {
      challenge: "Art of Frames needed a premium online presence to showcase personalized gifts, wall art, and custom creations in a way that feels as special as the products themselves.",
      solution: "We designed a cinematic, product-focused experience with clear categories, detailed product views, gallery browsing, and WhatsApp-based enquiries.",
      builtFor: ["Product Showcase", "WhatsApp Enquiries", "Mobile Experience"],
    },
  },
  {
    title: "Cafe Vibe",
    url: "https://cafevibebg.vercel.app/",
    domain: "cafevibebg.vercel.app",
    image: "/images/web-design/cafevibe-preview.png",
    subtitle: "Cafe / Food Business",
    tags: ["Business Website", "Menu", "Local Business"],
    caseStudy: {
      challenge: "Cafe Vibe needed a digital presence that could communicate its brand, showcase its offerings, and give customers an easy way to discover the business online.",
      solution: "We created a modern café-focused website with a visual-first experience, clear content structure, and easy access to essential business information.",
      builtFor: ["Business Website", "Menu Showcase", "Mobile Experience"],
    },
  },
  {
    title: "BizRavana OMS",
    url: "https://bizravana.com/",
    domain: "bizravana.com",
    image: "/images/web-design/bizravana-preview.png",
    subtitle: "Business Management SaaS",
    tags: ["SaaS Platform", "Dashboard", "Web App"],
    caseStudy: {
      challenge: "Small businesses often manage orders, expenses, inventory, and deliveries across multiple tools, making everyday operations harder to manage.",
      solution: "BizRavana brings essential business operations into one modern platform, with a clean dashboard designed to make everyday business management simpler and more organized.",
      builtFor: ["SaaS Platform", "Business Dashboard", "Responsive Web App"],
    },
  },
];

export default function ShowcaseStack() {
  const [activeCaseStudies, setActiveCaseStudies] = useState<Record<number, boolean>>({});

  const toggleCaseStudy = (idx: number) => {
    setActiveCaseStudies((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  return (
    <section id="showcase" className="py-28 relative bg-[#040406]">
      <div className="wd-container max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <div className="wd-badge-mono mb-4">
              <span className="wd-dot-pulse" />
              <span>[ PROVEN TRACK RECORD ]</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Websites Built to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b57] via-[#fd3a25] to-white">
                Make Businesses Stand Out.
              </span>
            </h2>
          </div>
          <p className="text-neutral-400 max-w-md text-sm sm:text-base leading-relaxed">
            From product-based businesses to service brands, we create custom websites designed around each business, its customers, and its goals.
          </p>
        </div>

        {/* Stacked Framed Cards */}
        <div className="space-y-10">
          {PROJECTS.map((proj, idx) => (            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="block rounded-[28px] sm:rounded-[34px] bg-[#ffffff] p-1.5 sm:p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.3)] border border-neutral-200/80 transition-all duration-500 group hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(253,58,37,0.18)]"
            >

              {/* ── MOBILE: Case Study Full-Card Panel (below lg) ──────────────────── */}
              {activeCaseStudies[idx] ? (
                <div className="lg:hidden rounded-[22px] bg-black p-6 flex flex-col gap-5 min-h-[320px] justify-center border border-[#fd3a25]/20 relative overflow-hidden">
                  {/* Ambient glow */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-52 h-52 bg-[#fd3a25]/10 blur-[80px] rounded-full pointer-events-none" />

                  {/* Label */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fd3a25]/10 border border-[#fd3a25]/25 text-[10px] font-mono font-black text-[#ff6b57] uppercase tracking-wider w-fit z-10">
                    Case Study — {proj.title}
                  </span>

                  <div className="space-y-4 z-10">
                    {/* Challenge */}
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-mono text-[#ff6b57] uppercase tracking-widest font-black">
                        The Challenge
                      </h4>
                      <p className="text-sm text-neutral-300 leading-relaxed">
                        {proj.caseStudy.challenge}
                      </p>
                    </div>
                    {/* Solution */}
                    <div className="space-y-1">
                      <h4 className="text-[10px] font-mono text-[#ff6b57] uppercase tracking-widest font-black">
                        Our Solution
                      </h4>
                      <p className="text-sm text-neutral-300 leading-relaxed">
                        {proj.caseStudy.solution}
                      </p>
                    </div>
                  </div>

                  {/* Built For */}
                  <div className="pt-3.5 border-t border-white/[0.06] flex flex-col gap-2 z-10">
                    <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest font-bold">
                      Built For
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.caseStudy.builtFor.map((feat, fIdx) => (
                        <span
                          key={fIdx}
                          className="px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[10px] font-mono text-neutral-300 uppercase tracking-wider"
                        >
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* ── MOBILE: Normal Image View ────────────────────────────────────── */
                <div className="lg:hidden relative w-full aspect-[16/9] rounded-[22px] bg-[#090a0f] overflow-hidden border border-black/5">
                  <Image
                    src={proj.image}
                    alt={proj.title}
                    fill
                    priority
                    className="object-cover object-top opacity-95 group-hover:scale-[1.02] transition-all duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </div>
              )}

              {/* ── DESKTOP: Image + Overlay (unchanged, hidden on mobile) ──────── */}
              <div className="hidden lg:block relative w-full aspect-[21/9] rounded-[28px] bg-[#090a0f] overflow-hidden border border-black/5">
                <Image
                  src={proj.image}
                  alt={proj.title}
                  fill
                  priority
                  className="object-cover object-top opacity-95 group-hover:scale-[1.02] transition-all duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-0" />

                {activeCaseStudies[idx] && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 p-6 sm:p-10 flex flex-col justify-center items-center text-center bg-black/85 md:bg-black/90 backdrop-blur-[4px] text-white z-10 overflow-y-auto border border-[#fd3a25]/15 rounded-[28px]"
                  >
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#fd3a25]/10 blur-[90px] rounded-full pointer-events-none z-0" />
                    <div className="max-w-2xl w-full space-y-5 sm:space-y-6 z-10 my-auto">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fd3a25]/10 border border-[#fd3a25]/25 text-[10px] sm:text-xs font-mono font-black text-[#ff6b57] uppercase tracking-wider">
                        Case Study — {proj.title}
                      </span>
                      <div className="space-y-4 sm:space-y-5 text-center">
                        <div className="space-y-1">
                          <h4 className="text-[10px] sm:text-xs font-mono text-[#ff6b57] uppercase tracking-widest font-black">The Challenge</h4>
                          <p className="text-xs sm:text-sm md:text-base text-neutral-300 leading-relaxed max-w-xl mx-auto font-normal">{proj.caseStudy.challenge}</p>
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-[10px] sm:text-xs font-mono text-[#ff6b57] uppercase tracking-widest font-black">Our Solution</h4>
                          <p className="text-xs sm:text-sm md:text-base text-neutral-300 leading-relaxed max-w-xl mx-auto font-normal">{proj.caseStudy.solution}</p>
                        </div>
                      </div>
                      <div className="pt-3.5 border-t border-white/[0.06] flex flex-col items-center gap-1.5">
                        <span className="text-[9px] font-mono text-neutral-500 uppercase tracking-widest font-bold">Built For</span>
                        <div className="flex flex-wrap justify-center gap-1.5">
                          {proj.caseStudy.builtFor.map((feat, fIdx) => (
                            <span key={fIdx} className="px-2.5 py-0.5 rounded-full bg-white/[0.04] border border-white/10 text-[9px] sm:text-[10px] font-mono text-neutral-300 uppercase tracking-wider">{feat}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* ── Lower Metadata Section ─────────────────────────────────────── */}

              {/* MOBILE: compact single-row — title left, buttons right */}
              <div className="lg:hidden px-4 pt-4 pb-3">
                <div className="flex items-center justify-between gap-3">
                  {/* Left: title + subtitle */}
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-lg font-black text-neutral-950 tracking-tight leading-tight truncate">
                      <span className="font-mono text-[#b31f10] mr-1">0{idx + 1} —</span>{proj.title}
                    </h3>
                    <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-wide mt-0.5 truncate">
                      {proj.subtitle}
                    </p>
                  </div>

                  {/* Right: action buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0 text-[10px] tracking-wider">
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCaseStudy(idx); }}
                      className="px-3.5 py-2 rounded-full border border-neutral-300 bg-white text-neutral-700 font-mono font-bold uppercase transition-all duration-300 cursor-pointer whitespace-nowrap"
                    >
                      {activeCaseStudies[idx] ? "← Back" : "Case Study"}
                    </button>
                    <a
                      href={proj.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-2 rounded-full bg-[#b31f10] text-white font-mono font-black uppercase transition-all duration-300 shadow-sm whitespace-nowrap"
                    >
                      Visit ↗
                    </a>
                  </div>
                </div>
              </div>

              {/* DESKTOP: full metadata grid (unchanged) */}
              <div className="hidden lg:block px-6 pt-5 pb-3 text-[#0a0b10]">
                <div className="grid grid-cols-12 gap-8 items-center">
                  {/* Title & Subtitle */}
                  <div className="col-span-5 flex flex-col justify-center">
                    <h3 className="text-3xl font-black text-neutral-950 tracking-tight leading-tight group-hover:text-[#b31f10] transition-colors">
                      <span className="font-mono text-[#b31f10] mr-2">0{idx + 1} —</span>{proj.title}
                    </h3>
                    <p className="text-sm text-neutral-500 font-bold mt-1.5 uppercase tracking-wide">
                      {proj.subtitle}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="col-span-4 flex flex-col items-center justify-center w-full">
                    <div className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest font-bold mb-2">Project tags</div>
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {proj.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="px-2.5 py-1 rounded-md bg-neutral-100 border border-neutral-200/60 text-[10px] font-mono font-bold text-neutral-600 uppercase tracking-wider">{tag}</span>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="col-span-3 flex flex-col items-end justify-center w-full">
                    <div className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest font-bold mb-2.5">Actions</div>
                    <div className="flex flex-col items-end gap-3 w-full text-xs tracking-wider">
                      <button
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleCaseStudy(idx); }}
                        className="w-full text-center px-4 py-2.5 rounded-full border border-neutral-300 hover:border-neutral-400 bg-white hover:bg-neutral-50 text-neutral-700 hover:text-neutral-900 font-mono font-bold uppercase transition-all duration-300 cursor-pointer flex items-center justify-center gap-1"
                      >
                        <span>{activeCaseStudies[idx] ? "← Back" : "Case Study"}</span>
                      </button>
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full text-center px-4 py-2.5 rounded-full bg-[#b31f10] hover:bg-[#8f1a0d] text-white font-mono font-black uppercase transition-all duration-300 shadow-sm shadow-[#b31f10]/25 hover:shadow-[#8f1a0d]/35 flex items-center justify-center gap-1"
                      >
                        <span>Visit Website ↗</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA to /portfolio */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-16 sm:mt-20 flex flex-col items-center justify-center text-center space-y-6 pt-10 border-t border-white/[0.04]"
        >
          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Want to see our live industry demos & concepts?
            </h3>
            <p className="text-sm text-neutral-400 max-w-lg mx-auto">
              Explore high-converting client concept websites built across Fitness, Healthcare, Hotels, Jewellery, and more.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <Link
              href="/portfolio"
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#ff6b57] via-[#fd3a25] to-[#d42c1a] hover:from-[#ff8a7a] hover:to-[#e8321e] text-white text-sm font-black shadow-[0_10px_30px_rgba(253,58,37,0.35)] hover:scale-105 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span>Explore Full Portfolio & Demos</span>
              <ArrowUpRight className="w-4 h-4 text-white" />
            </Link>
            <a
              href="#pricing"
              className="px-8 py-3.5 rounded-full bg-white/[0.06] hover:bg-white/10 text-white text-sm font-bold border border-white/15 transition-all"
            >
              View Web Design Pricing
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
