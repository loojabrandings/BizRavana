"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const PROJECTS = [
  {
    title: "Art of Frames",
    url: "https://artofframes.netlify.app/",
    domain: "artofframes.netlify.app",
    image: "/images/web-design/artofframes-preview.png",
    description: "Bespoke keepsake framing atelier; +64% international WhatsApp orders.",
    deliverables: "UI/UX Architecture, Next.js, WhatsApp Automation",
    industry: "Luxury & Craft",
  },
  {
    title: "Cafe Vibe",
    url: "https://cafevibebg.vercel.app/",
    domain: "cafevibebg.vercel.app",
    image: "/images/web-design/cafevibe-preview.png",
    description: "Artisan dining experience; interactive menu & 1-tap table reservation flow.",
    deliverables: "Interactive Menu UI, Mobile Speed, Reservation Engine",
    industry: "Hospitality",
  },
  {
    title: "BizRavana Cloud OMS",
    url: "https://bizravana.com/",
    domain: "bizravana.com",
    image: "/images/web-design/bizravana-preview.png",
    description: "Enterprise ERP & POS platform; real-time order, inventory and profit management.",
    deliverables: "Next.js 15 Full-Stack, Realtime Sync, Cloud DB",
    industry: "Enterprise SaaS",
  },
];

export default function ShowcaseStack() {
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
              Built to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8be0b7] via-[#6fc59b] to-white">
                Be Seen.
              </span>
            </h2>
          </div>
          <p className="text-neutral-400 max-w-md text-sm sm:text-base leading-relaxed">
            A few things we&apos;ve built for modern businesses. Click any card to launch the live platform.
          </p>
        </div>

        {/* Stacked Framed Cards matching Reference Screenshot */}
        <div className="space-y-10">
          {PROJECTS.map((proj, idx) => (
            <motion.a
              key={idx}
              href={proj.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="block rounded-[28px] sm:rounded-[34px] bg-[#ffffff] p-1.5 sm:p-2.5 shadow-[0_25px_60px_rgba(0,0,0,0.3)] border border-neutral-200/80 transition-all duration-500 group hover:-translate-y-1 hover:shadow-[0_30px_70px_rgba(111,197,155,0.2)] cursor-pointer"
            >
              {/* Inner Dark Frame Canvas */}
              <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] rounded-[22px] sm:rounded-[28px] bg-[#000000] overflow-hidden border border-black/5">
                <Image
                  src={proj.image}
                  alt={proj.title}
                  fill
                  priority
                  className="object-cover object-top opacity-95 group-hover:scale-[1.02] group-hover:opacity-100 transition-all duration-700"
                />

                {/* Subtle dark gradient overlay at bottom for the View Project button */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {/* Floating "View Project" Pill Link */}
                <div className="absolute bottom-4 right-5 sm:bottom-5 sm:right-7 z-10">
                  <div className="text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 drop-shadow-md group-hover:text-[#8be0b7] transition-colors">
                    <span>View Project</span>
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>
                </div>
              </div>

              {/* Lower Metadata Section */}
              <div className="px-4 sm:px-6 pt-5 pb-3 text-[#0a0b10]">
                {/* 4 Status Indicator Dots */}
                <div className="flex items-center gap-1.5 mb-5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="w-2 h-2 rounded-full bg-neutral-300" />
                  <span className="w-2 h-2 rounded-full bg-neutral-300" />
                  <span className="w-2 h-2 rounded-full bg-neutral-300" />
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                  {/* Title & Domain */}
                  <div className="lg:col-span-4">
                    <h3 className="text-2xl sm:text-3xl font-black text-neutral-950 tracking-tight leading-tight group-hover:text-[#2d6a4f] transition-colors">
                      {proj.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <div className="lg:col-span-3">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold mb-1">
                      DESCRIPTION
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                      {proj.description}
                    </p>
                  </div>

                  {/* Deliverables */}
                  <div className="lg:col-span-3">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold mb-1">
                      DELIVERABLES
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed font-normal">
                      {proj.deliverables}
                    </p>
                  </div>

                  {/* Industry */}
                  <div className="lg:col-span-2">
                    <div className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest font-bold mb-1">
                      INDUSTRY
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-900 font-bold">
                      {proj.industry}
                    </p>
                  </div>
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
