"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "How long does it take to build a website?",
    a: "Most websites take around 5–21 working days, depending on the package, content and complexity.",
  },
  {
    q: "Do you provide the domain and hosting?",
    a: "Yes. We can help you set up your domain and hosting. Hosting and domain fees may be billed separately depending on the selected setup.",
  },
  {
    q: "Can you redesign my existing website?",
    a: "Yes. We can redesign an existing website while improving its visual design, usability, mobile experience and performance.",
  },
  {
    q: "Will my website work on mobile phones?",
    a: "Yes. All websites are designed to be responsive across mobile, tablet and desktop devices.",
  },
  {
    q: "Can I update the website myself?",
    a: "For websites that include a CMS or admin panel, you can manage supported content yourself. Otherwise, our maintenance plans can handle ongoing updates.",
  },
];

export default function FaqAccordion() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 relative bg-[#060608]">
      <div className="wd-container max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="wd-badge-mono mb-4">
            <span className="wd-dot-pulse" />
            <span>[ FREQUENTLY ASKED QUESTIONS ]</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">
            Got Questions? <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b57] via-[#fd3a25] to-white">
              We Have Direct Answers.
            </span>
          </h2>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-500 overflow-hidden ${isOpen
                  ? "border-[#fd3a25]/60 shadow-[0_20px_45px_-10px_rgba(0,0,0,0.8),0_0_35px_-5px_rgba(253, 58, 37, 0.3)] bg-gradient-to-br from-[#200504] via-[#160302] to-[#06080c]"
                  : "bg-[#0c0d12]/80 border-white/[0.08] hover:border-[#fd3a25]/40 hover:bg-gradient-to-br hover:from-[#1a0403] hover:via-[#120202] hover:to-[#07080c]"
                  }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span
                    className={`text-base sm:text-lg font-bold tracking-tight transition-colors duration-300 ${isOpen ? "text-[#ff6b57]" : "text-white group-hover:text-white"
                      }`}
                  >
                    {faq.q}
                  </span>
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 flex-shrink-0 ${isOpen
                      ? "rotate-180 bg-[#fd3a25] text-white shadow-[0_0_15px_#fd3a25]"
                      : "bg-white/[0.04] border border-white/10 text-neutral-300"
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
                      <div className="px-6 pb-6 pt-2 text-sm sm:text-base text-neutral-200 leading-relaxed border-t border-[#fd3a25]/15">
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
    </section>
  );
}
