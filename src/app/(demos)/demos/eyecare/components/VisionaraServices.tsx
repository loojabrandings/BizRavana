'use client';

import React from 'react';
import Image from 'next/image';
import { Check, Clock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useVisionaraStore } from './VisionaraStore';

interface ServiceItem {
  id: string;
  number: string;
  name: string;
  image: string;
  shortDesc: string;
  priceLKR: string;
  duration: string;
  idealFor: string;
  steps: string[];
  badge: string;
}

const servicesData: ServiceItem[] = [
  {
    id: 'eye-exam',
    number: '01',
    name: 'Full Digital Eye Checkup',
    image: '/demos/eyecare/service_scan.jpg',
    shortDesc: 'A complete, comfortable checkup to test your eyesight and check for eye health problems with zero discomfort.',
    priceLKR: 'Rs. 2,500',
    duration: '20 Minutes',
    idealFor: 'Everyone (Recommended once a year)',
    steps: [
      'Zero-pain digital retinal scanner (No stinging drops)',
      'Accurate power check for distance and reading vision',
      'One-on-one consultation with our senior eye specialist',
    ],
    badge: 'MOST POPULAR',
  },
  {
    id: 'computer-vision',
    number: '02',
    name: 'Screen Relief & Blue-Light Shield',
    image: '/demos/eyecare/service_screen.jpg',
    shortDesc: 'Specialized optical testing for software engineers, students, and professionals working long screen hours.',
    priceLKR: 'Rs. 2,000',
    duration: '15 Minutes',
    idealFor: 'IT professionals, students, remote workers',
    steps: [
      'Testing eye muscle fatigue and dry-eye levels',
      'Custom blue-light filtering lens prescription',
      'Free anti-glare lens coating upgrade included',
    ],
    badge: 'RECOMMENDED FOR WORK',
  },
  {
    id: 'kids-vision',
    number: '03',
    name: 'Children & Student Vision Care',
    image: '/demos/eyecare/service_kids.jpg',
    shortDesc: 'Gentle, friendly vision tests to help kids read clearly in school without squinting or headaches.',
    priceLKR: 'Rs. 2,000',
    duration: '25 Minutes',
    idealFor: 'Children aged 4 to 18 years',
    steps: [
      'Child-friendly interactive picture charts (fun & stress-free)',
      'Early detection of lazy eye and reading difficulties',
      'Durable, flexible, unbreakable frames for kids',
    ],
    badge: 'GENTLE & CARING',
  },
  {
    id: 'cataract-glaucoma',
    number: '04',
    name: 'Senior Glaucoma & Retina Scan',
    image: '/demos/eyecare/service_glaucoma.jpg',
    shortDesc: 'High-precision eye pressure and corneal clarity tests for healthy eyesight in your golden years.',
    priceLKR: 'Rs. 3,500',
    duration: '30 Minutes',
    idealFor: 'Adults aged 45+ and diabetic patients',
    steps: [
      'Advanced air-puff intraocular pressure scan',
      'High-detail retina photo check for diabetic eye changes',
      'Printed doctor diagnostic report to take home',
    ],
    badge: 'DOCTOR LED',
  },
];

export function VisionaraServices() {
  const { activeServiceId, setActiveServiceId } = useVisionaraStore();

  return (
    <section
      id="treatments"
      className="relative w-full py-28 md:py-36 text-white px-6 md:px-14 lg:px-20 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto">
        {/* ── SECTION HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-950/60 border border-blue-800/40 text-[11px] font-bold tracking-[0.2em] text-blue-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>02 // CLINICAL EYE SERVICES</span>
            </div>
            <h2 className="font-['Syne',sans-serif] text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-[1.1] text-white">
              Clinical Excellence.
              <br />
              <span className="text-blue-400">Painless & Affordable Eye Care.</span>
            </h2>
          </div>

          <p className="text-sm md:text-base text-white/70 max-w-md leading-relaxed font-normal">
            Every appointment includes advanced digital optical diagnostics and a friendly consultation with our senior eye specialists.
          </p>
        </div>

        {/* ── REDESIGNED 2x2 VISUAL SERVICES SHOWCASE GRID ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
          {servicesData.map((item) => {
            const isSelected = item.id === activeServiceId;
            return (
              <div
                key={item.id}
                onClick={() => setActiveServiceId(item.id)}
                className={`group flex flex-col justify-between border transition-all duration-300 overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/20 shadow-2xl scale-[1.01]'
                    : 'border-white/15 bg-zinc-950/40 hover:border-blue-500/50 hover:bg-blue-950/10'
                }`}
              >
                {/* Visual Image Header with Floating Badges */}
                <div className="relative aspect-[16/9] w-full overflow-hidden bg-black">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Top Floating Badges */}
                  <div className="absolute top-4 left-4 flex items-center space-x-2 z-10">
                    <span className="px-3 py-1 bg-black/80 backdrop-blur-md border border-blue-500/50 text-blue-300 text-[10px] font-extrabold uppercase tracking-widest font-mono">
                      {item.number} // {item.badge}
                    </span>
                  </div>

                  {/* Floating Price & Duration Banner */}
                  <div className="absolute bottom-3 right-3 px-3.5 py-1.5 bg-black/85 backdrop-blur-md border border-emerald-500/40 text-right z-10 flex items-center space-x-3">
                    <div className="flex items-center space-x-1 text-[11px] text-white/70">
                      <Clock className="w-3 h-3 text-blue-400" />
                      <span>{item.duration}</span>
                    </div>
                    <span className="font-['Syne',sans-serif] text-base font-black text-emerald-400">
                      {item.priceLKR}
                    </span>
                  </div>
                </div>

                {/* Card Body & Specs */}
                <div className="p-6 md:p-8 flex flex-col justify-between flex-1 space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-['Syne',sans-serif] text-xl sm:text-2xl font-bold uppercase text-white group-hover:text-blue-300 transition-colors">
                      {item.name}
                    </h3>

                    <p className="text-xs md:text-sm text-white/75 leading-relaxed font-normal">
                      {item.shortDesc}
                    </p>

                    {/* Step Checklist */}
                    <div className="space-y-2.5 pt-2 border-t border-white/10">
                      {item.steps.map((step, idx) => (
                        <div key={idx} className="flex items-start space-x-2.5 text-xs text-white/85">
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-2.5 h-2.5 text-emerald-400" />
                          </div>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Action & Insurance Notice */}
                  <div className="pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-1.5 text-[11px] text-white/60">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Insurance Claimable in Sri Lanka</span>
                    </div>

                    <a
                      href="#booking"
                      className="w-full sm:w-auto px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-['Syne',sans-serif] text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-colors shadow-lg cursor-pointer"
                    >
                      <span>BOOK THIS CHECKUP</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
