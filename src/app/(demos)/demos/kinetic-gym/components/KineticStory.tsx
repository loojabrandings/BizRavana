'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';

export function KineticStory() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Staggered parallax translation values for dual column vertical cards
  const colLeftY = useTransform(scrollYProgress, [0, 1], ['5%', '-15%']);
  const colRightY = useTransform(scrollYProgress, [0, 1], ['-8%', '15%']);
  const centerScale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1, 0.95]);

  return (
    <section
      id="story"
      ref={containerRef}
      className="relative py-24 sm:py-32 md:py-40 bg-[#0D0D0D] overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-[#E10600]/10 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center">
          
          {/* Left Column Gallery (2 Vertical Cards) */}
          <motion.div
            style={{ y: colLeftY }}
            className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6"
          >
            {/* Gallery Card 1 */}
            <div className="group relative h-60 sm:h-72 lg:h-80 rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-black">
              <Image
                src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=800&auto=format&fit=crop"
                alt="Strength Zone"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover object-center group-hover:scale-110 transition-transform duration-700 filter brightness-90 contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="font-poppins text-[11px] font-semibold tracking-wider text-white uppercase bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                  Iron Room
                </span>
                <span className="text-[#E10600] font-bebas text-sm tracking-widest">01</span>
              </div>
            </div>

            {/* Gallery Card 2 */}
            <div className="group relative h-60 sm:h-72 lg:h-80 rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-black">
              <Image
                src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop"
                alt="Gym Equipment Setup"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover object-center group-hover:scale-110 transition-transform duration-700 filter brightness-90 contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="font-poppins text-[11px] font-semibold tracking-wider text-white uppercase bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                  Dumbbell Hub
                </span>
                <span className="text-[#E10600] font-bebas text-sm tracking-widest">02</span>
              </div>
            </div>
          </motion.div>

          {/* Center Column: Core Philosophy Text */}
          <motion.div
            style={{ scale: centerScale }}
            className="lg:col-span-6 flex flex-col items-center text-center px-2 sm:px-6 py-6"
          >
            <div className="inline-flex items-center gap-2 mb-3 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-[#E10600]" />
              <span className="font-poppins text-xs uppercase tracking-widest text-white/80 font-medium">
                Our Sri Lankan Manifesto
              </span>
            </div>

            <h2 className="font-bebas text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-white tracking-wide leading-none mb-6">
              WHERE <span className="text-[#E10600]">STRENGTH</span> IS FORGED
            </h2>

            <p className="font-poppins text-sm sm:text-base md:text-lg text-[#9A9A9A] leading-relaxed max-w-xl font-light">
              We are Sri Lanka&apos;s premier high-performance strength facility. Combining imported Eleiko powerlifting bars, certified national trainers, customized Sri Lankan nutrition plans, and an electrifying Colombo community to help you crush your athletic and physique goals.
            </p>

            <div className="mt-8 flex items-center gap-6 sm:gap-10">
              <div className="flex flex-col items-center">
                <span className="font-bebas text-3xl sm:text-4xl text-[#E10600]">100%</span>
                <span className="font-poppins text-xs text-[#9A9A9A] tracking-wider uppercase">Results Driven</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="font-bebas text-3xl sm:text-4xl text-white">8,500+</span>
                <span className="font-poppins text-xs text-[#9A9A9A] tracking-wider uppercase">Sq. Ft. in Colombo</span>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div className="flex flex-col items-center">
                <span className="font-bebas text-3xl sm:text-4xl text-[#E10600]">SLBF</span>
                <span className="font-poppins text-xs text-[#9A9A9A] tracking-wider uppercase">Certified Coaches</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column Gallery (2 Vertical Cards) */}
          <motion.div
            style={{ y: colRightY }}
            className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-1 gap-4 sm:gap-6"
          >
            {/* Gallery Card 3 (Muscular Pull-up Athlete) */}
            <div className="group relative h-60 sm:h-72 lg:h-80 rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-black">
              <Image
                src="https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=800&auto=format&fit=crop"
                alt="Pull-ups Athlete"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover object-center group-hover:scale-110 transition-transform duration-700 filter brightness-90 contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="font-poppins text-[11px] font-semibold tracking-wider text-white uppercase bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                  Calisthenics
                </span>
                <span className="text-[#E10600] font-bebas text-sm tracking-widest">03</span>
              </div>
            </div>

            {/* Gallery Card 4 (Machines / Training Floor) */}
            <div className="group relative h-60 sm:h-72 lg:h-80 rounded-2xl overflow-hidden border border-white/10 shadow-xl bg-black">
              <Image
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=800&auto=format&fit=crop"
                alt="Functional Zone"
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover object-center group-hover:scale-110 transition-transform duration-700 filter brightness-90 contrast-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                <span className="font-poppins text-[11px] font-semibold tracking-wider text-white uppercase bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-white/10">
                  Sprint Turf
                </span>
                <span className="text-[#E10600] font-bebas text-sm tracking-widest">04</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
