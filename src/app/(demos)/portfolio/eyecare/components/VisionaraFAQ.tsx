'use client';

import React from 'react';
import { ChevronDown, ShieldCheck, Phone } from 'lucide-react';
import { useVisionaraStore } from './VisionaraStore';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'Does the eye checkup hurt or use stinging eye drops?',
    answer:
      'No, not at all! We use modern digital scanners that test your eyesight and retina in seconds without any painful stinging drops or bright discomfort. You can drive and return to work immediately after the test.',
  },
  {
    question: 'How long does it take to get my new glasses?',
    answer:
      'For standard prescription and blue-light glasses, we can cut and fit your lenses in our Colombo lab within 2 to 4 hours on the same day! For specialized progressive or high-power lenses, it takes 24 to 48 hours with free home delivery across Sri Lanka.',
  },
  {
    question: 'Can I claim my eye test or glasses with my health insurance in Sri Lanka?',
    answer:
      'Yes! We provide official medical receipts and doctor prescription reports approved by all major insurance companies in Sri Lanka including Ceylinco, AIA, Sri Lanka Insurance (SLIC), Softlogic Life, Union Assurance, Fairfirst, and Allianz.',
  },
  {
    question: 'Can I bring my own old frame and only change the lenses?',
    answer:
      'Yes, absolutely! If you already have a favorite frame you love, our optical technicians will inspect it for free and fit fresh, crystal-clear lenses to match your new eye prescription.',
  },
  {
    question: 'Do I need to book an appointment in advance or can I walk in?',
    answer:
      'Walk-ins are always welcome at our Colombo, Kandy, and Galle clinics! However, booking a quick online slot or messaging us on WhatsApp ensures zero waiting time with our senior eye specialists.',
  },
];

const insurancePartners = [
  'Ceylinco Life',
  'AIA Insurance',
  'Sri Lanka Insurance',
  'Softlogic Life',
  'Union Assurance',
  'Fairfirst Insurance',
  'Allianz Lanka',
  'LOLC Life',
];

export function VisionaraFAQ() {
  const { openFaqIndex, setOpenFaqIndex } = useVisionaraStore();

  const toggleFAQ = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <section
      id="faq"
      className="relative w-full py-28 md:py-36 bg-transparent text-white px-6 md:px-14 lg:px-20 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto">
        {/* ── SECTION HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-teal-950/60 border border-teal-800/40 text-[11px] font-bold tracking-[0.2em] text-teal-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span>08 // COMMON QUESTIONS</span>
            </div>
            <h2 className="font-['Syne',sans-serif] text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-[1.1] text-white">
              Questions & Insurance.
              <br />
              <span className="text-teal-400">Everything You Need To Know.</span>
            </h2>
          </div>

          <p className="text-sm md:text-base text-white/70 max-w-md leading-relaxed font-normal">
            Have questions before your visit? Here are honest answers to the most common questions our patients ask.
          </p>
        </div>

        {/* ── 2-COLUMN FAQ & INSURANCE SPLIT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Accordion (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`border overflow-hidden transition-all duration-200 ${
                    isOpen
                      ? 'bg-blue-950/40 border-blue-500 shadow-xl'
                      : 'bg-zinc-950 border-white/10 hover:border-white/30'
                  }`}
                >
                  <button
                    onClick={() => toggleFAQ(idx)}
                    className="w-full p-6 text-left flex items-center justify-between group cursor-pointer"
                  >
                    <span className="font-['Syne',sans-serif] text-base md:text-lg font-bold uppercase text-white group-hover:text-blue-300 transition-colors pr-4">
                      {faq.question}
                    </span>
                    <div
                      className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 transition-transform duration-200 ${
                        isOpen
                          ? 'rotate-180 bg-blue-600 border-blue-500 text-white'
                          : 'border-white/20 text-white/60 group-hover:border-white'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-xs md:text-sm text-white/80 leading-relaxed border-t border-white/10">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Right: Insurance Partners & Direct Support (5 cols) */}
          <div className="lg:col-span-5 p-8 bg-zinc-950 border border-blue-900/40 space-y-6 shadow-2xl">
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% HEALTH INSURANCE SUPPORT</span>
              </div>
              <h3 className="font-['Syne',sans-serif] text-2xl font-bold uppercase text-white">
                Covered by Sri Lankan Insurers
              </h3>
              <p className="text-xs text-white/70 leading-relaxed font-normal">
                We issue stamped medical bills and doctor diagnostic forms so you can easily claim your eye exam and spectacle costs.
              </p>
            </div>

            {/* Insurance Partners Ticker / Badges */}
            <div className="grid grid-cols-2 gap-2 pt-2">
              {insurancePartners.map((ins, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-zinc-900 border border-white/10 text-center text-xs font-semibold text-white/80 hover:border-blue-500/40 hover:text-blue-300 transition-colors"
                >
                  {ins}
                </div>
              ))}
            </div>

            {/* Emergency Hotline */}
            <div className="p-4 bg-blue-950/40 border border-blue-800/40 pt-4 space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-blue-300">
                STILL HAVE QUESTIONS?
              </div>
              <p className="text-xs text-white/70">
                Call our direct patient support desk anytime:
              </p>
              <a
                href="tel:0112684500"
                className="font-['Syne',sans-serif] text-lg font-bold text-blue-400 flex items-center space-x-2 hover:underline"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>011 268 4500 / 077 123 4567</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
