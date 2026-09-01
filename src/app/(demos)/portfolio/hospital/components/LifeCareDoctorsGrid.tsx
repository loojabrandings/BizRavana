'use client';

import React from 'react';
import { GraduationCap } from 'lucide-react';
import { DOCTORS } from '../doctors/data';
import { useScrollReveal } from '../hooks/useScrollReveal';

export function LifeCareDoctorsGrid() {
  const ref = useScrollReveal();

  return (
    <section
      id="doctors"
      ref={ref}
      className="w-full py-16 sm:py-24 bg-white relative overflow-hidden scroll-mt-20 border-t border-slate-200/80"
    >
      {/* Ghost numeral */}
      <div className="hidden lg:block absolute top-8 right-0 font-dm-sans font-bold text-[260px] leading-none text-[#0D1527]/[0.035] select-none pointer-events-none">
        06
      </div>

      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 relative">
        {/* Section Header */}
        <div className="max-w-2xl mb-10 sm:mb-14 reveal-fade-up">
          <div className="inline-flex items-center gap-1.5 bg-[#102BDC]/10 border border-[#102BDC]/20 px-3.5 py-1 rounded-full text-xs font-inter font-semibold text-[#102BDC] w-fit mb-4">
            <span className="w-2 h-2 rounded-full bg-[#102BDC] animate-pulse" />
            <span>The Team — 06 Consultants</span>
          </div>
          <h2 className="font-dm-sans font-bold text-2xl sm:text-3xl lg:text-[38px] text-[#0D1527] leading-[1.2] tracking-[-0.03em] mb-4">
            Choose your <span className="text-[#102BDC]">specialist.</span>
          </h2>
          <p className="font-inter font-normal text-sm sm:text-base text-[#475569] leading-[1.65]">
            Every consultant below channels at our Balangoda hospital. Their
            qualifications and specialties are listed, so you know exactly who
            you are meeting.
          </p>
        </div>

        {/* Doctors Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 reveal-fade-up">
          {DOCTORS.map((doctor) => (
            <article
              key={doctor.id}
              className="group rounded-3xl border border-slate-200/80 bg-white overflow-hidden shadow-sm hover:shadow-xl hover:shadow-blue-900/10 hover:border-[#102BDC]/40 transition-all duration-300"
            >
              {/* Photo */}
              <div className="relative aspect-[3/4] overflow-hidden bg-slate-100">
                <img
                  src={doctor.photo}
                  alt={doctor.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.05]"
                />
                <span className="absolute top-3 right-3 rounded-full bg-white/90 backdrop-blur-sm border border-white/60 px-2.5 py-1 font-dm-sans font-bold text-xs text-[#102BDC] tabular-nums">
                  {doctor.num}
                </span>
                <span className="absolute bottom-3 left-3 right-12 rounded-full bg-[#0D1527]/70 backdrop-blur-sm border border-white/20 px-3 py-1.5 text-[10px] font-inter font-semibold uppercase tracking-wider text-white truncate">
                  {doctor.designation}
                </span>
              </div>

              {/* Credentials */}
              <div className="p-5 sm:p-6">
                <h3 className="font-dm-sans font-bold text-lg sm:text-xl text-[#0D1527] group-hover:text-[#102BDC] transition-colors leading-snug">
                  {doctor.name}
                </h3>

                <div className="mt-2 flex items-start gap-1.5">
                  <GraduationCap
                    size={15}
                    className="text-[#102BDC] flex-shrink-0 mt-0.5"
                  />
                  <span className="font-inter text-[11px] sm:text-xs text-[#64748B] leading-snug">
                    {doctor.qualifications}
                  </span>
                </div>

                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {doctor.specialties.map((specialty) => (
                    <span
                      key={specialty}
                      className="rounded-full bg-[#102BDC]/10 border border-[#102BDC]/20 px-2.5 py-1 font-inter text-[10px] sm:text-[11px] font-medium text-[#102BDC]"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>

                <p className="mt-4 font-inter text-xs sm:text-sm text-[#475569] leading-relaxed">
                  {doctor.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}