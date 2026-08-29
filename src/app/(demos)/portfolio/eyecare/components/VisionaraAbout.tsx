'use client';

import React from 'react';
import { Eye, CheckCircle2, HeartHandshake, Glasses, ArrowUpRight } from 'lucide-react';

export function VisionaraAbout() {
  const stats = [
    {
      value: '15,000+',
      color: 'text-blue-400',
      label: 'Happy Patients',
      detail: 'People who trust us for clear eyesight every year in Sri Lanka.',
    },
    {
      value: '100%',
      color: 'text-teal-400',
      label: 'Painless Testing',
      detail: 'Quick and gentle eye checkups with zero discomfort.',
    },
    {
      value: '25+ Yrs',
      color: 'text-amber-400',
      label: 'Experience',
      detail: 'Over two decades of expert care and trusted advice.',
    },
    {
      value: 'Same-Day',
      color: 'text-emerald-400',
      label: 'Glasses Ready',
      detail: 'Fast custom fitting in our Colombo optical lab.',
    },
  ];

  const highlights = [
    {
      icon: Eye,
      iconColor: 'text-blue-400',
      boxBorder: 'border-blue-900/40',
      bgChip: 'bg-blue-950/40',
      title: 'Digital Eye Checkups',
      desc: 'Quick, advanced digital scans that find vision problems before they get worse.',
    },
    {
      icon: CheckCircle2,
      iconColor: 'text-teal-400',
      boxBorder: 'border-teal-900/40',
      bgChip: 'bg-teal-950/40',
      title: 'Clear & Protected Lenses',
      desc: 'High-quality lenses that stop eye strain from phone and computer screens.',
    },
    {
      icon: HeartHandshake,
      iconColor: 'text-amber-400',
      boxBorder: 'border-amber-900/40',
      bgChip: 'bg-amber-950/40',
      title: 'Expert Eye Doctors',
      desc: 'Caring specialists who take the time to explain everything in simple terms.',
    },
    {
      icon: Glasses,
      iconColor: 'text-indigo-400',
      boxBorder: 'border-indigo-900/40',
      bgChip: 'bg-indigo-950/40',
      title: 'Comfortable Frames',
      desc: 'Lightweight, durable glasses designed to fit your face and look great all day.',
    },
  ];

  return (
    <section
      id="about"
      className="relative w-full py-24 md:py-32 bg-transparent text-white px-6 md:px-14 lg:px-20 overflow-hidden border-t border-white/10 font-['Plus_Jakarta_Sans',sans-serif]"
    >
      <div className="max-w-7xl mx-auto">
        {/* ── SECTION HEADER (SIMPLE & CLEAR) ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-950/60 border border-blue-800/40 text-[11px] font-bold tracking-[0.2em] text-blue-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>01 // ABOUT US</span>
            </div>
            <h2 className="font-['Syne',sans-serif] text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-[1.1] text-white">
              Clearer Vision.
              <br />
              <span className="text-blue-400">Better Everyday Life.</span>
            </h2>
          </div>

          <p className="text-sm md:text-base text-white/70 max-w-md leading-relaxed font-normal">
            At Visionara, we make eye care simple and stress-free. From quick digital eye tests to comfortable glasses, we help you see the world clearly every single day.
          </p>
        </div>

        {/* ── TWO COLUMN MAIN CONTENT ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: 4 Simple Pillars (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {highlights.map((item, idx) => {
                const IconComponent = item.icon;
                return (
                  <div
                    key={idx}
                    className={`p-6 bg-zinc-950/80 border ${item.boxBorder} hover:border-white/40 transition-all duration-200 group`}
                  >
                    <div className={`w-10 h-10 mb-4 flex items-center justify-center ${item.bgChip} border ${item.boxBorder} ${item.iconColor}`}>
                      <IconComponent className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                    </div>
                    <h3 className="font-['Syne',sans-serif] text-base font-bold text-white mb-2 uppercase tracking-wide">
                      {item.title}
                    </h3>
                    <p className="text-xs text-white/60 leading-relaxed font-normal">
                      {item.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Doctor Note */}
            <div className="p-6 md:p-8 bg-zinc-950 border-l-4 border-blue-500 border-y border-r border-white/10 pl-6 mt-6">
              <p className="font-['Syne',sans-serif] text-base md:text-lg font-semibold text-white/90 italic leading-snug">
                “Good eyesight changes how you work, read, and enjoy life. Our promise is to give you simple, honest, and expert eye care.”
              </p>
              <div className="mt-3 flex items-center justify-between text-xs font-bold uppercase tracking-wider">
                <span className="text-blue-400">Dr. Elena Vance</span>
                <span className="text-white/40">Senior Eye Specialist</span>
              </div>
            </div>
          </div>

          {/* Right Column: 4 Simple Numbers (5 cols) */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="relative p-6 bg-zinc-950/80 border border-white/10 hover:border-white/40 transition-all duration-200 group flex flex-col justify-between"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className={`font-['Syne',sans-serif] text-3xl sm:text-4xl font-black tracking-tight ${stat.color} group-hover:translate-x-1 transition-transform duration-200`}>
                    {stat.value}
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-white/30 group-hover:text-white transition-colors" />
                </div>

                <div>
                  <h4 className="font-['Syne',sans-serif] text-xs font-bold uppercase tracking-wider text-white mb-1">
                    {stat.label}
                  </h4>
                  <p className="text-xs text-white/50 leading-relaxed font-normal">
                    {stat.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── BOTTOM SIMPLE HIGHLIGHTS ── */}
        <div className="mt-16 pt-8 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-[11px] text-white/50 font-bold uppercase tracking-[0.2em]">
          <span className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            <span>EASY & PAINLESS CHECKUPS</span>
          </span>
          <span className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-teal-500 rounded-full" />
            <span>BLUE LIGHT FILTER GLASSES</span>
          </span>
          <span className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" />
            <span>SAME-DAY APPOINTMENTS</span>
          </span>
          <span className="flex items-center space-x-2">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span>100% QUALITY GUARANTEE</span>
          </span>
        </div>
      </div>
    </section>
  );
}
