'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote, ShieldCheck, CheckCircle2, Award } from 'lucide-react';

const TESTIMONIALS = [
  {
    id: 't-1',
    name: 'Dr. Mohan & Priyanthi Weerasinghe',
    role: 'Expat Buyers, London, UK',
    transaction: 'Purchased Luxury Villa in Ward Place, Colombo 07',
    quote: 'Living in the UK, buying property in Sri Lanka was terrifying due to title deed horror stories. Aura Estates conducted full 30-year deed searches, video walkthroughs, and handled our legal power-of-attorney flawlessly. Absolute peace of mind.',
    rating: 5,
  },
  {
    id: 't-2',
    name: 'Dilshan Samarasekera',
    role: 'Managing Director & Property Investor',
    transaction: 'Sold Lakefront Property in Rajagiriya in 24 Days',
    quote: 'Other brokers brought dozens of random time-wasters. Aura Estates brought three pre-qualified buyers in two weeks, and we closed the transaction at 98% of our asking price with clean legal escrow.',
    rating: 5,
  },
  {
    id: 't-3',
    name: 'Jean-Luc & Anoma Moreau',
    role: 'Boutique Hotelier & Investor, Melbourne',
    transaction: 'Acquired Restored Dutch Heritage Villa in Galle Fort',
    quote: 'Their knowledge of Southern coastal heritage titles, UNESCO zoning, and foreign investment repatriation in Sri Lanka is second to none. The finest bespoke real estate agency on the island.',
    rating: 5,
  },
];

export function RealEstateTestimonials() {
  return (
    <section className="relative w-full py-24 sm:py-32 bg-[#F3F1ED] text-[#141416] select-none">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        
        {/* ── Section Header ────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E8E5DF] mb-4 shadow-sm">
              <Award className="w-3.5 h-3.5 text-[#C5A880]" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#141416]">
                Client Experiences
              </span>
            </div>

            <h2 className="text-4xl sm:text-6xl md:text-7xl text-[#141416] leading-[1.02] tracking-tight">
              <span className="re-font-sans font-light uppercase tracking-wider block text-2xl sm:text-4xl text-[#141416]/70 mb-1">
                Trusted by Discerning
              </span>
              <span className="re-font-serif font-normal text-5xl sm:text-7xl md:text-8xl tracking-tight block text-[#141416]">
                Homeowners & Investors
              </span>
            </h2>
          </div>

          {/* Social Proof Badges */}
          <div className="flex items-center gap-6">
            <div className="p-4 rounded-2xl bg-white border border-[#E8E5DF] shadow-sm">
              <p className="text-2xl sm:text-3xl font-bold text-[#141416]">LKR 14.8 Bn+</p>
              <p className="text-[11px] uppercase tracking-wider text-[#6E7178] mt-0.5">Transactions Closed</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-[#E8E5DF] shadow-sm">
              <p className="text-2xl sm:text-3xl font-bold text-[#141416]">100%</p>
              <p className="text-[11px] uppercase tracking-wider text-[#6E7178] mt-0.5">Clean Title Record</p>
            </div>
          </div>
        </div>

        {/* ── 3 Testimonials Grid ──────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {TESTIMONIALS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.1 }}
              className="p-8 sm:p-9 rounded-3xl bg-white border border-[#E8E5DF] shadow-sm hover:shadow-xl hover:border-[#141416]/20 transition-all duration-400 flex flex-col justify-between"
            >
              <div>
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-[#C5A880] mb-5">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>

                {/* Quote Text */}
                <p className="text-sm sm:text-base text-[#2C2E33] leading-relaxed italic mb-6">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Transaction & Client Name */}
              <div className="pt-6 border-t border-[#E8E5DF]">
                <span className="inline-block text-[10px] font-semibold uppercase tracking-wider text-[#A8895E] bg-[#FAF9F6] px-2.5 py-1 rounded-md mb-2">
                  {item.transaction}
                </span>
                <h4 className="re-font-serif text-lg font-medium text-[#141416]">
                  {item.name}
                </h4>
                <p className="text-xs text-[#6E7178] mt-0.5">
                  {item.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
