"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Sparkles } from "lucide-react";

const FAQS = [
  {
    q: "How long does it take to build a website?",
    a: "Most websites take around 5–21 working days, depending on the package, content availability, and custom functionality requirements.",
  },
  {
    q: "Do you provide the domain and hosting?",
    a: "Yes. We help you set up and configure high-performance cloud hosting and custom domain names. Hosting fees can be included in your plan.",
  },
  {
    q: "Can you redesign my existing website?",
    a: "Yes. We specialize in complete redesigns, improving visual elegance, load speeds, mobile responsiveness, and sales conversion rates.",
  },
  {
    q: "Will my website work perfectly on mobile phones?",
    a: "Absolutely. Every website is engineered mobile-first to ensure 100% responsiveness across all smartphone and tablet screen sizes.",
  },
  {
    q: "Can I update the website myself after launch?",
    a: "Yes. If your package includes CMS access, you can manage content with ease. Otherwise, our ongoing maintenance plans can handle all updates for you.",
  },
];

export default function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-28 relative bg-[#0C0C0C] border-t border-white/[0.06]">
      <div className="wd-container max-w-6xl mx-auto">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16 sm:mb-20">
          <div className="wd-badge-mono mb-6">
            <Sparkles className="w-3.5 h-3.5 text-[#ff6b57]" />
            <span>[ FREQUENTLY ASKED QUESTIONS ]</span>
          </div>

          <h2
            className="hero-heading font-kanit font-black uppercase leading-none tracking-tight text-center select-none mb-6"
            style={{ fontSize: "clamp(2.8rem, 11vw, 150px)" }}
          >
            FAQ
          </h2>

          <p className="text-neutral-400 text-sm sm:text-base font-kanit max-w-xl mx-auto leading-relaxed">
            Direct answers to common questions about our web design process, timelines, and deliverables.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`rounded-[28px] sm:rounded-[36px] border-2 transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "border-[#fd3a25] bg-[#120807] shadow-[0_20px_45px_rgba(0,0,0,0.8),0_0_35px_rgba(253,58,37,0.25)]"
                    : "bg-[#0C0C0C] border-[#D7E2EA]/20 hover:border-white/40"
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-6 sm:p-7 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span
                    className={`text-base sm:text-lg font-bold font-kanit uppercase tracking-tight transition-colors duration-300 ${
                      isOpen ? "text-[#ff8a7a]" : "text-white"
                    }`}
                  >
                    {faq.q}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${
                      isOpen
                        ? "rotate-180 bg-[#fd3a25] text-white shadow-[0_0_15px_#fd3a25]"
                        : "bg-white/[0.06] border border-white/10 text-neutral-300"
                    }`}
                  >
                    <ChevronDown className="w-4 h-4 stroke-[2.5]" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                    >
                      <div className="px-6 sm:px-7 pb-6 pt-1 text-sm sm:text-base text-neutral-300 font-light leading-relaxed border-t border-[#fd3a25]/20 font-kanit">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
        </div>
      </div>
    </section>
  );
}
