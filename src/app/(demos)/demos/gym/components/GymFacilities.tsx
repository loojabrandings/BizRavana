'use client';

import React, { useState } from 'react';
import Image from 'next/image';

interface Facility {
  number: string;
  title: string;
  tagline: string;
  description: string;
  src: string;
}

const FACILITIES: Facility[] = [
  {
    number: '01',
    title: 'Strength Zone',
    tagline: 'Build Strength. Get Stronger.',
    description:
      'A dedicated space for serious strength training, with equipment for every stage of your fitness journey.',
    src: '/demos/gym/strength.jpeg',
  },
  {
    number: '02',
    title: 'Cardio Zone',
    tagline: 'Get Your Heart Moving.',
    description:
      'Keep your endurance on track with dedicated cardio equipment for warm-ups, conditioning and fat-loss workouts.',
    src: '/demos/gym/cardio.jpeg',
  },
  {
    number: '03',
    title: 'Free Weights',
    tagline: 'Train Without Limits.',
    description:
      'Dumbbells, barbells and free-weight equipment for building strength, muscle and control.',
    src: '/demos/gym/weights.jpeg',
  },
  {
    number: '04',
    title: 'Functional Training Area',
    tagline: 'Move. Perform. Improve.',
    description:
      'Open training space for functional workouts, mobility, conditioning and dynamic exercises.',
    src: '/demos/gym/functional.jpeg',
  },
  {
    number: '05',
    title: 'Personal Training Area',
    tagline: 'Focused. Personal. Effective.',
    description:
      'A dedicated environment for one-on-one coaching and goal-focused training.',
    src: '/demos/gym/personal.jpeg',
  },
  {
    number: '06',
    title: 'Changing & Locker Facilities',
    tagline: 'Train. Refresh. Go.',
    description:
      'Convenient changing and storage facilities to make your gym routine easier from start to finish.',
    src: '/demos/gym/locker.jpeg',
  },
];

export const GymFacilities: React.FC = () => {
  const [activeCard, setActiveCard] = useState<string | null>(null);

  const toggleCard = (num: string) => {
    setActiveCard((prev) => (prev === num ? null : num));
  };

  return (
    <section id="tour" className="relative bg-[#050505] text-[#FEF9F5] py-24 sm:py-32 lg:py-40 overflow-hidden border-t border-white/10">

      {/* ── Ambient Glows ───────────────────────────────────── */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-[#CCFF00]/5 rounded-full blur-[170px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-[#7B7457]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">

        {/* ── Section Header ─────────────────────────────────── */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-white/5 border border-[#CCFF00]/30 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#CCFF00]">
              THE GYM
            </span>
          </div>

          <h2 className="font-impact italic text-4xl sm:text-6xl lg:text-7xl uppercase leading-[0.95] text-[#FEF9F5] mb-5">
            BUILT FOR YOUR <br />
            <span className="text-[#CCFF00]">BEST TRAINING.</span>
          </h2>

          <p className="text-sm sm:text-base text-[#FEF9F5]/70 leading-relaxed font-normal max-w-2xl">
            A focused training environment with the equipment, space and facilities you need to train harder, move better and stay consistent.
          </p>
        </div>

        {/* ── Facility Visual Gallery Grid ────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {FACILITIES.map((facility) => {
            const isActive = activeCard === facility.number;

            return (
              <div
                key={facility.number}
                onClick={() => toggleCard(facility.number)}
                className={`group relative rounded-3xl overflow-hidden bg-[#0e0e0e] border transition-all duration-500 flex flex-col justify-end min-h-[380px] sm:min-h-[440px] shadow-xl hover:shadow-2xl hover:shadow-[#CCFF00]/20 cursor-pointer select-none ${
                  isActive
                    ? 'border-[#CCFF00] shadow-2xl shadow-[#CCFF00]/20'
                    : 'border-white/10 hover:border-[#CCFF00]/60'
                }`}
              >
                {/* Background Image: Dims on normal state, 100% full clear on hover or tap */}
                <div className="absolute inset-0 z-0">
                  <Image
                    src={facility.src}
                    alt={facility.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={`object-cover object-center transition-all duration-700 ease-out group-hover:scale-105 group-hover:brightness-100 ${
                      isActive
                        ? 'scale-105 brightness-100'
                        : 'brightness-[0.4]'
                    }`}
                  />
                  {/* Dark Gradient Overlay: Fades completely on hover / active tap */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/65 to-transparent transition-opacity duration-500 group-hover:opacity-0 ${
                      isActive ? 'opacity-0' : 'opacity-100'
                    }`}
                  />
                </div>

                {/* Top Tag & Number: Hidden on hover / active tap */}
                <div
                  className={`absolute top-6 left-6 right-6 flex items-center justify-between z-10 transition-all duration-400 pointer-events-none group-hover:opacity-0 group-hover:-translate-y-2 ${
                    isActive ? 'opacity-0 -translate-y-2' : 'opacity-100'
                  }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/15 text-[#CCFF00]">
                    ZONE {facility.number}
                  </span>
                  <span className="font-impact italic text-2xl text-white/20">
                    {facility.number}
                  </span>
                </div>

                {/* Bottom Content Area: Tagline & description hide on hover/tap, headline stays visible */}
                <div className="relative z-10 p-6 sm:p-8">
                  {/* Tagline (Hidden on hover / active tap) */}
                  <span
                    className={`text-xs font-bold uppercase tracking-wider text-[#CCFF00] block font-body transition-all duration-400 group-hover:opacity-0 group-hover:h-0 group-hover:overflow-hidden ${
                      isActive ? 'opacity-0 h-0 overflow-hidden mb-0' : 'opacity-100'
                    }`}
                  >
                    {facility.tagline}
                  </span>

                  {/* Headline (STAYS VISIBLE) */}
                  <h3 className="font-impact italic text-2xl sm:text-3xl uppercase tracking-tight text-[#FEF9F5] drop-shadow-[0_2px_14px_rgba(0,0,0,0.95)] transition-all duration-300 group-hover:text-white">
                    {facility.title}
                  </h3>

                  {/* Description (Hidden on hover / active tap) */}
                  <p
                    className={`text-xs sm:text-sm text-[#FEF9F5]/70 leading-relaxed font-normal pt-1 transition-all duration-400 group-hover:opacity-0 group-hover:h-0 group-hover:overflow-hidden group-hover:pt-0 ${
                      isActive ? 'opacity-0 h-0 overflow-hidden pt-0' : 'opacity-100'
                    }`}
                  >
                    {facility.description}
                  </p>
                </div>

                {/* Active Bottom Glow Line */}
                <div
                  className={`absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent transition-opacity duration-500 z-10 group-hover:opacity-100 ${
                    isActive ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
