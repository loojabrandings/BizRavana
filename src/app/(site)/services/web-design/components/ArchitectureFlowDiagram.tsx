"use client";

import { motion } from "framer-motion";
import { 
  Compass, 
  Layers, 
  Palette, 
  Code2, 
  Rocket, 
  Sparkles,
  CheckCircle2
} from "lucide-react";

const STEPS = [
  {
    num: "01",
    phase: "DISCOVERY & STRATEGY",
    title: "Discover",
    desc: "We learn about your business, customers, competitors and goals.",
    icon: Compass,
    timeline: "Days 1–2",
    deliverable: "Strategic Brand Brief",
  },
  {
    num: "02",
    phase: "INFORMATION ARCHITECTURE",
    title: "Plan",
    desc: "We define the sitemap, content structure and user journey.",
    icon: Layers,
    timeline: "Days 3–4",
    deliverable: "Wireframe & Sitemap Blueprint",
  },
  {
    num: "03",
    phase: "VISUAL CRAFTSMANSHIP",
    title: "Design",
    desc: "We create the visual direction and interface for your website.",
    icon: Palette,
    timeline: "Days 5–8",
    deliverable: "Interactive Figma Prototype",
  },
  {
    num: "04",
    phase: "DEVELOPMENT & SPEED",
    title: "Develop",
    desc: "Your approved design is transformed into a responsive, high-performance website.",
    icon: Code2,
    timeline: "Days 9–12",
    deliverable: "Next.js Full-Stack Codebase",
  },
  {
    num: "05",
    phase: "QA & DEPLOYMENT",
    title: "Launch",
    desc: "We test everything, optimize the experience and get your website live.",
    icon: Rocket,
    timeline: "Days 13–14",
    deliverable: "Live Worldwide Deployment",
  },
];

export default function ArchitectureFlowDiagram() {
  return (
    <section id="solutions" className="py-24 relative bg-[#040406]">
      <div className="wd-container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-20">
          <div className="wd-badge-mono mb-4">
            <span className="wd-dot-pulse" />
            <span>[ PROCESS ]</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            From Idea to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8be0b7] via-[#6fc59b] to-white">
              Launch.
            </span>
          </h2>
          <p className="text-neutral-400 text-sm sm:text-base">
            A clear, structured 5-stage sprint from first discovery to a sub-second live website.
          </p>
        </div>

        {/* Editorial Scroll Timeline Layout */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical connecting laser spine on desktop and tablet */}
          <div className="absolute top-8 bottom-8 left-6 md:left-1/2 w-0.5 -translate-x-1/2 bg-gradient-to-b from-[#6fc59b] via-[#6fc59b]/40 to-[#6fc59b]/10 z-0" />

          <div className="space-y-12 md:space-y-16 relative z-10">
            {STEPS.map((step, idx) => {
              const IconComp = step.icon;
              const isEven = idx % 2 === 1;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-12 pl-14 md:pl-0 ${
                    isEven ? "md:flex-row-reverse" : ""
                  }`}
                >
                  {/* Step Card */}
                  <div
                    className={`w-full md:w-[calc(50%-3rem)] wd-glass-card p-6 sm:p-8 border-white/[0.08] hover:border-[#6fc59b]/40 transition-all duration-300 group relative ${
                      isEven ? "md:text-right" : "md:text-left"
                    }`}
                  >
                    <div
                      className={`flex items-center gap-3 mb-3 ${
                        isEven ? "md:justify-end" : "md:justify-start"
                      }`}
                    >
                      <span className="text-[10px] font-mono font-bold px-2.5 py-0.5 rounded bg-[#6fc59b]/10 text-[#8be0b7] border border-[#6fc59b]/20 tracking-wider uppercase">
                        {step.phase}
                      </span>
                      <span className="text-xs font-mono text-neutral-500">
                        {step.timeline}
                      </span>
                    </div>

                    <h3 className="text-2xl font-extrabold text-white tracking-tight mb-2 group-hover:text-[#8be0b7] transition-colors">
                      {step.num} — {step.title}
                    </h3>

                    <p className="text-neutral-300 text-sm leading-relaxed mb-4">
                      {step.desc}
                    </p>

                    <div
                      className={`pt-4 border-t border-white/[0.06] flex items-center gap-2 text-xs font-mono text-neutral-400 ${
                        isEven ? "md:justify-end" : "md:justify-start"
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#6fc59b] flex-shrink-0" />
                      <span>{step.deliverable}</span>
                    </div>
                  </div>

                  {/* Center Node Indicator */}
                  <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-[#0d0e14] border-2 border-[#6fc59b] shadow-[0_0_20px_rgba(111,197,155,0.6)] flex items-center justify-center text-[#8be0b7] group hover:scale-110 transition-transform">
                    <IconComp className="w-5 h-5" />
                  </div>

                  {/* Desktop Empty Spacer for Symmetry */}
                  <div className="hidden md:block w-[calc(50%-3rem)]" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
