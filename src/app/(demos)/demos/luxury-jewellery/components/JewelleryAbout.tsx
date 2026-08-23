'use client';

import React from 'react';
import Image from 'next/image';

export function JewelleryAbout() {
  const values = [
    {
      num: '01',
      title: 'Ancestral Craftsmanship',
      desc: 'Each piece is hand-cast and polished by master artisans using centuries-old European goldsmith traditions.',
    },
    {
      num: '02',
      title: 'Ethical Brilliance',
      desc: 'We ethically source only conflict-free, GIA-certified stones with complete origin transparency.',
    },
    {
      num: '03',
      title: 'Bespoke Atelier',
      desc: 'Collaborate directly with our master jewellers to create a singular, one-of-a-kind heirloom.',
    },
  ];

  return (
    <section 
      id="about" 
      className="relative w-full py-28 sm:py-36 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[#000000] via-[#04120d] to-[#0D2D25] text-[#F6EFE7] overflow-hidden"
    >
      {/* ── Ambient Subtle Emerald Depth (No Gold) ────────────────── */}
      <div className="absolute top-1/3 -left-32 w-[600px] h-[600px] bg-[#0D2D25]/40 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 -right-32 w-[500px] h-[500px] bg-[#0D2D25]/25 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto space-y-16 sm:space-y-24 relative z-10">
        
        {/* ── Minimal Editorial Headline ───────────────────────────── */}
        <div className="max-w-3xl space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-6 h-[1px] bg-[#C6A05F]" />
            <span className="text-[11px] sm:text-xs font-medium tracking-[0.3em] text-[#C6A05F] uppercase font-sans">
              The Maison
            </span>
          </div>

          <h2 className="font-custom-brand text-4xl sm:text-6xl md:text-7xl lg:text-[5.2rem] leading-[0.9] text-[#F6EFE7] lowercase font-normal select-none">
            the art of subtle luxury
          </h2>
        </div>

        {/* ── Main Minimal 2-Column Section ────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Clean Minimalist Showcase Image */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative w-full aspect-[4/5] rounded-2xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              <Image
                src="/demos/luxury-jewellery/hero-3.jpeg"
                alt="Câlin High Jewellery Craftsmanship"
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 550px"
                className="object-cover object-center transition-transform duration-1000 ease-out hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
            </div>

            <div className="flex items-center justify-between text-xs text-[#F6EFE7]/60 font-mono">
              <span>Atelier Câlin • Est. 1994</span>
              <span>18K Solid Gold</span>
            </div>
          </div>

          {/* Right Column: Editorial Narrative & Minimalist Values */}
          <div className="lg:col-span-7 space-y-10 sm:space-y-12">
            
            {/* Philosophical Statement */}
            <p className="font-italiana text-2xl sm:text-3xl md:text-4xl text-[#F6EFE7] leading-snug font-normal">
              &ldquo;We believe jewellery is wearable emotion — each piece sculpted with deliberate patience to transcend generations.&rdquo;
            </p>

            {/* Clean Numbered Rows with Hairline Dividers (No Cards) */}
            <div className="space-y-6 pt-2">
              {values.map((item) => (
                <div 
                  key={item.num}
                  className="pt-6 border-t border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 items-baseline"
                >
                  <span className="sm:col-span-2 text-xs font-mono text-[#C6A05F] font-semibold tracking-wider">
                    [ {item.num} ]
                  </span>
                  <div className="sm:col-span-10 space-y-1.5">
                    <h3 className="font-italiana text-xl sm:text-2xl text-[#F6EFE7] font-normal tracking-wide">
                      {item.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#F6EFE7]/70 leading-relaxed font-light font-sans">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Minimalist Action Link */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <a
                href="#contact"
                className="inline-flex items-center gap-3 text-xs sm:text-sm uppercase tracking-[0.2em] font-medium text-[#F6EFE7] hover:text-[#C6A05F] transition-colors duration-300 group"
              >
                <span>Discover The Atelier</span>
                <span className="transform transition-transform duration-300 group-hover:translate-x-1 text-[#C6A05F]">
                  →
                </span>
              </a>

              <span className="text-xs font-mono text-[#F6EFE7]/40 tracking-widest uppercase">
                Bespoke • Paris
              </span>
            </div>

          </div>

        </div>

      </div>

    </section>
  );
}
