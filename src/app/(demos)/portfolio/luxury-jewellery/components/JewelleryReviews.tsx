'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

const TESTIMONIALS = [
  {
    id: 1,
    quote:
      'The quality and craftsmanship are absolutely stunning. I get compliments every single time I wear my solitaire ring!',
    author: 'Emily R.',
    location: 'London, UK',
    initials: 'ER',
    rating: 5,
  },
  {
    id: 2,
    quote:
      'Luxury elegance and breathtaking packaging. The bespoke emerald choker was crafted to absolute perfection.',
    author: 'Olivia M.',
    location: 'New York, USA',
    initials: 'OM',
    rating: 5,
  },
  {
    id: 3,
    quote:
      'Beautiful designs, certified ethical diamonds, and warm concierge service. Câlin has become our family jeweler.',
    author: 'Sophia L.',
    location: 'Paris, France',
    initials: 'SL',
    rating: 5,
  },
];

export function JewelleryReviews() {
  const [activeMobileIndex, setActiveMobileIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (scrollRef.current) {
      const scrollLeft = scrollRef.current.scrollLeft;
      const cardWidth = scrollRef.current.offsetWidth * 0.85;
      const index = Math.round(scrollLeft / cardWidth);
      setActiveMobileIndex(Math.min(Math.max(index, 0), TESTIMONIALS.length - 1));
    }
  };

  const scrollToIndex = (index: number) => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.offsetWidth * 0.85;
      scrollRef.current.scrollTo({
        left: index * cardWidth,
        behavior: 'smooth',
      });
      setActiveMobileIndex(index);
    }
  };

  return (
    <section className="relative w-full py-10 sm:py-14 px-4 sm:px-6 lg:px-8 bg-[#FAF6F0] text-[#0D2D25] overflow-hidden border-t border-[#0D2D25]/10">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-10">
        
        {/* ── Section Header (Low-Height Minimalist) ───────────────────────── */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-3 border-b border-[#0D2D25]/10"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-4 h-[1.5px] bg-[#C6A05F]" />
              <span className="text-[11px] font-semibold tracking-[0.25em] text-[#C6A05F] uppercase font-sans">
                Customer Voices
              </span>
            </div>
            <h2 className="font-italiana text-2xl sm:text-3xl lg:text-4xl text-[#0D2D25] tracking-wider uppercase font-normal">
              What Our Customers Say
            </h2>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#C6A05F] font-mono">
            <span>★★★★★</span>
            <span className="text-[#0D2D25]/60 text-[11px] font-sans">4.9 / 5 Verified Reviews</span>
          </div>
        </motion.div>

        {/* ── Wide, Borderless, Background-Free Review Cards ───────────────── */}
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          className="-mx-4 px-6 sm:mx-0 sm:px-0 flex overflow-x-auto snap-x snap-mandatory gap-6 sm:gap-8 pb-3 pt-1 no-scrollbar md:grid md:grid-cols-3 md:gap-10 scroll-smooth"
        >
          {TESTIMONIALS.map((item, idx) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.7, delay: 0.1 * idx, ease: [0.16, 1, 0.3, 1] }}
              className="w-[85vw] max-w-[380px] sm:w-[420px] md:w-full snap-center flex-shrink-0 flex flex-col justify-between space-y-4 group cursor-pointer"
            >
              <div className="space-y-2.5">
                {/* 5-Star Rating with delicate quote mark */}
                <div className="flex items-center justify-between text-[#C6A05F]">
                  <div className="flex items-center gap-0.5 text-xs">
                    {[...Array(item.rating)].map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <span className="font-italiana text-2xl text-[#C6A05F]/40 select-none group-hover:text-[#C6A05F] transition-colors">
                    “
                  </span>
                </div>

                {/* Review Body */}
                <p className="text-xs sm:text-[13.5px] text-[#0D2D25]/85 font-light leading-relaxed font-sans group-hover:text-[#0D2D25] transition-colors">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="flex items-center gap-3 pt-3 border-t border-[#0D2D25]/10">
                <div className="w-8 h-8 rounded-full bg-[#0D2D25] text-[#F6EFE7] flex items-center justify-center font-italiana text-xs font-semibold group-hover:bg-[#C6A05F] transition-colors">
                  {item.initials}
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#0D2D25] font-sans">
                    {item.author}
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-[#0D2D25]/60 font-sans">
                    {item.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Mobile Dot Indicators ────────────────────────────────── */}
        <div className="flex md:hidden items-center justify-center gap-2 pt-0.5">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`transition-all duration-300 rounded-full ${
                activeMobileIndex === i
                  ? 'w-6 h-1.5 bg-[#C6A05F]'
                  : 'w-1.5 h-1.5 bg-[#0D2D25]/20'
              }`}
            />
          ))}
        </div>

      </div>
    </section>
  );
}
