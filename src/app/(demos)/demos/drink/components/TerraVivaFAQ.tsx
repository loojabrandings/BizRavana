'use client';

import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  HelpCircle,
  ShieldCheck,
  Leaf,
  Snowflake,
  Sparkles,
  MessageCircle,
} from 'lucide-react';

const DIETARY_BADGES = [
  {
    icon: Leaf,
    title: '100% Vegan & Plant-Based',
    desc: 'Zero dairy, gelatin, or animal derivatives',
  },
  {
    icon: ShieldCheck,
    title: 'Keto & Paleo Friendly',
    desc: '0g added sugar & low glycemic load',
  },
  {
    icon: Sparkles,
    title: 'Non-GMO & Gluten-Free',
    desc: 'Independently lab tested for purity',
  },
  {
    icon: Snowflake,
    title: 'Raw Cold-Chain Stored',
    desc: 'Unpasteurized & active living enzymes',
  },
];

const FAQS = [
  {
    question: 'What is the shelf life of TerraViva and how should it be stored?',
    answer:
      'Because TerraViva is raw hydraulic cold-pressed without boiling heat or chemical preservatives, we recommend keeping your cans refrigerated between 34°F – 38°F (1°C – 3°C). Each can retains peak botanical vitality, active enzymes, and crisp flavor for 90 days from the canning date stamped on the bottom.',
  },
  {
    question: 'Does TerraViva contain any added sugars, stevia, or artificial sweeteners?',
    answer:
      'Absolutely zero. No cane sugar, high-fructose corn syrup, erythritol, stevia, monk fruit, or gums. Every gram of sweetness is 100% naturally derived from whole, sun-ripened organic fruit harvested at peak Brix levels.',
  },
  {
    question: 'How does refrigerated cold shipping work?',
    answer:
      'Every order is packaged inside 100% recyclable insulated thermal liners with eco-friendly non-toxic ice packs. We ship via express carbon-neutral freight so your cans arrive refreshingly chilled right to your front door.',
  },
  {
    question: 'Is TerraViva certified Vegan, Gluten-Free, and Non-GMO?',
    answer:
      'Yes. All four signature harvests are officially USDA Certified Organic, Non-GMO Project Verified, 100% Vegan, and naturally Gluten-Free with zero cross-contamination.',
  },
  {
    question: 'Why do you use aluminum cans instead of glass or plastic bottles?',
    answer:
      'Aluminum blocks 100% of UV sunlight and oxygen—the two biggest enemies of raw cold-pressed nutrients and live enzymes. Aluminum is also infinitely recyclable (over 75% of all aluminum ever made is still in circular use today), and our cans feature a certified BPA-free protective inner lining.',
  },
  {
    question: 'What is your 30-Day Fresh Taste Guarantee policy?',
    answer:
      'We stand behind every drop we press. If you are not completely captivated by the fresh orchard flavor of your first box, simply message our care team within 30 days and we will issue a complete refund with no hassle.',
  },
];

export function TerraVivaFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const ambientGlowY = useTransform(scrollYProgress, [0, 1], [-80, 80]);

  const toggleAccordion = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      ref={sectionRef}
      id="faq"
      className="relative w-full bg-stone-950 text-white py-24 sm:py-32 px-4 sm:px-8 lg:px-12 overflow-hidden select-none"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* Ambient Background Glow with Parallax */}
      <motion.div
        style={{ y: ambientGlowY }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 pointer-events-none"
      >
        <div
          style={{
            width: 'clamp(400px, 70vw, 1000px)',
            height: '450px',
            background: 'radial-gradient(ellipse at center, rgba(78,154,104,0.14) 0%, rgba(41,182,246,0.06) 50%, transparent 80%)',
            filter: 'blur(70px)',
          }}
        />
      </motion.div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* 1. Header (Animated on Scroll) */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-3xl mx-auto mb-16 sm:mb-20"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-3.5">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
              FREQUENTLY ASKED QUESTIONS
            </span>
          </div>

          <h2
            className="text-4xl sm:text-6xl font-normal uppercase tracking-tight text-white leading-[1.05]"
            style={{ fontFamily: "'Anton', sans-serif" }}
          >
            CLEAR ANSWERS. PURE FACTS.
          </h2>

          <p className="mt-4 text-sm sm:text-base text-white/60 leading-relaxed">
            Everything you need to know about our cold-pressed craft, shelf life, dietary certifications, and refrigerated delivery.
          </p>
        </motion.div>

        {/* 2. Dietary Certifications & Standards Grid (Staggered Entrance) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-14 sm:mb-16">
          {DIETARY_BADGES.map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <motion.div
                key={badge.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="flex flex-col items-start gap-2.5 p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-md cursor-pointer hover:border-emerald-500/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Icon className="w-4 h-4" strokeWidth={2.2} />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    {badge.title}
                  </h4>
                  <p className="text-[11px] text-white/50 leading-tight mt-0.5">
                    {badge.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* 3. Interactive Accordion (Staggered Reveal on Scroll) */}
        <div className="flex flex-col gap-3.5 sm:gap-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className={`rounded-2xl border transition-all duration-300 backdrop-blur-xl overflow-hidden ${
                  isOpen
                    ? 'border-emerald-500/40 bg-white/[0.04] shadow-lg shadow-emerald-950/20'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.03]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleAccordion(index)}
                  className="w-full py-5 px-6 sm:px-7 flex items-center justify-between text-left gap-4 cursor-pointer focus:outline-none"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-semibold text-white tracking-tight">
                    {faq.question}
                  </span>
                  <div
                    className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400 rotate-180'
                        : 'border-white/15 bg-white/5 text-white/50'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3, ease: 'easeInOut' }}
                      className="px-6 sm:px-7 pb-6 pt-1 text-xs sm:text-sm text-white/65 leading-relaxed border-t border-white/5"
                    >
                      <p>{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* 4. Help Desk Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 sm:mt-16 text-center"
        >
          <div className="inline-flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-3.5 px-6 rounded-2xl bg-white/[0.02] border border-white/10 text-xs sm:text-sm text-white/70">
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Have more questions? Our organic care team is here 24/7 at</span>
            <a
              href="mailto:hello@terraviva.com"
              className="text-emerald-400 font-semibold underline underline-offset-4 hover:text-emerald-300 transition-colors"
            >
              hello@terraviva.com
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default TerraVivaFAQ;
