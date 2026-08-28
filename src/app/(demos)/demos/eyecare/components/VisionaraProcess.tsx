'use client';

import React from 'react';
import { Scan, MessageSquare, Sparkles, Truck, CheckCircle2 } from 'lucide-react';

export function VisionaraProcess() {
  const steps = [
    {
      num: '01',
      time: '5-10 MINS',
      title: 'Quick Digital Eye Scan',
      desc: 'You look into our high-tech digital scanner. It instantly maps your eyes without any stinging drops or pain.',
      icon: Scan,
      tag: 'Zero Pain',
      color: 'text-blue-400',
      borderAccent: 'border-blue-900/40',
      badgeBg: 'bg-blue-950/60 text-blue-400 border-blue-800/40',
    },
    {
      num: '02',
      time: '15 MINS',
      title: 'Doctor Explanation',
      desc: 'Our friendly eye specialist shows your test results on a screen and explains your eye health in simple Sinhala or English.',
      icon: MessageSquare,
      tag: 'Clear Answers',
      color: 'text-teal-400',
      borderAccent: 'border-teal-900/40',
      badgeBg: 'bg-teal-950/60 text-teal-400 border-teal-800/40',
    },
    {
      num: '03',
      time: '10-15 MINS',
      title: 'Frame & Lens Selection',
      desc: 'Try our feather-light titanium and stylish frames. We help you choose the shape that looks best on your face.',
      icon: Sparkles,
      tag: 'Face-Shape Match',
      color: 'text-amber-400',
      borderAccent: 'border-amber-900/40',
      badgeBg: 'bg-amber-950/60 text-amber-400 border-amber-800/40',
    },
    {
      num: '04',
      time: 'SAME-DAY / 24H',
      title: 'Custom Fitting & Pickup',
      desc: 'Your custom lenses are cut and fitted in our precision lab. Pick them up in 2 hours or get free delivery to your home in Sri Lanka.',
      icon: Truck,
      tag: 'Islandwide Delivery',
      color: 'text-emerald-400',
      borderAccent: 'border-emerald-900/40',
      badgeBg: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/40',
    },
  ];

  return (
    <section className="relative w-full py-28 md:py-36 bg-transparent text-white px-6 md:px-14 lg:px-20 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* ── SECTION HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-24 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-emerald-950/60 border border-emerald-800/40 text-[11px] font-bold tracking-[0.2em] text-emerald-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>04 // EASY 4-STEP PROCESS</span>
            </div>
            <h2 className="font-['Syne',sans-serif] text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-[1.1] text-white">
              How Your Visit Works.
              <br />
              <span className="text-emerald-400">Smooth, Simple, and Fast.</span>
            </h2>
          </div>

          <p className="text-sm md:text-base text-white/70 max-w-md leading-relaxed font-normal">
            We respect your busy schedule. Most appointments are completed comfortably in under 35 minutes with zero waiting time.
          </p>
        </div>

        {/* ── CONNECTED STEP TIMELINE (NON-CARD LINEAR PATH) ── */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {steps.map((step, idx) => {
              const IconComp = step.icon;
              return (
                <div
                  key={idx}
                  className={`flex flex-col justify-between p-6 bg-zinc-950 border ${step.borderAccent} hover:border-white/40 transition-all duration-200 group`}
                >
                  <div>
                    {/* Top step Number & Time */}
                    <div className="flex items-center justify-between mb-6">
                      <span className={`font-['Syne',sans-serif] text-3xl font-black ${step.color}`}>
                        {step.num}
                      </span>
                      <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${step.badgeBg}`}>
                        {step.time}
                      </span>
                    </div>

                    {/* Icon Node */}
                    <div className={`w-12 h-12 mb-6 flex items-center justify-center bg-zinc-900 border ${step.borderAccent} ${step.color}`}>
                      <IconComp className="w-5 h-5" />
                    </div>

                    <h3 className="font-['Syne',sans-serif] text-lg font-bold uppercase text-white mb-2 leading-snug">
                      {step.title}
                    </h3>

                    <p className="text-xs text-white/60 leading-relaxed font-normal">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-white/10 flex items-center space-x-2 text-[10px] font-bold text-white/50 uppercase tracking-wider">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{step.tag}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
