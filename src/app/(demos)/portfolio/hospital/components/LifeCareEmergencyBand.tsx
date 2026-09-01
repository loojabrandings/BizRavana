'use client';

import React from 'react';
import { PhoneCall, Siren } from 'lucide-react';
import { LifeCareEcgLine } from './LifeCareEcgLine';
import { useScrollReveal } from '../hooks/useScrollReveal';

const ROUND_THE_CLOCK = ['ETU & OPD', 'Laboratory', 'Ambulance Service'];

export function LifeCareEmergencyBand() {
  const ref = useScrollReveal();

  return (
    <section
      ref={ref}
      className="w-full py-16 sm:py-24 bg-white relative overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="relative rounded-3xl overflow-hidden shadow-2xl reveal-fade-up flex flex-col lg:grid lg:grid-cols-12 min-h-[420px]">
          {/* Card Background: same emergency image as the landing page */}
          <img
            src="/demos/hospital/emergency.jpeg"
            alt="LifeCare Emergency Service"
            loading="lazy"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#4C0519]/95 via-[#881337]/90 to-[#450A0A]/95" />
          <div className="absolute inset-0 svc-grid-red" />

          {/* ECG trace */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[100px] opacity-50 pointer-events-none">
            <LifeCareEcgLine variant="white" />
          </div>

          {/* Left: Message */}
          <div className="relative z-10 lg:col-span-7 flex flex-col justify-center p-7 sm:p-10 lg:p-14 reveal-slide-left">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 px-3 py-1 rounded-full text-[11px] font-inter font-semibold text-white w-fit mb-4">
              <Siren size={14} />
              <span>Emergency · 24 HRS</span>
            </div>

            <h2 className="font-dm-sans font-bold text-2xl sm:text-3xl lg:text-[38px] text-white leading-[1.2] tracking-[-0.03em] mb-3">
              Every second <span className="text-[#FDA4AF]">counts.</span>
            </h2>

            <p className="font-inter text-sm sm:text-base text-white/85 leading-relaxed max-w-xl mb-6">
              Call now. Our emergency team and ambulance are ready for you —
              24 hours, every day of the year. Walk straight into the ETU. No
              appointment needed.
            </p>

            <div className="flex flex-wrap gap-2.5">
              {ROUND_THE_CLOCK.map((title) => (
                <span
                  key={title}
                  className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-3.5 py-1.5 font-inter text-[11px] font-medium text-white/90"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FDA4AF] animate-pulse" />
                  {title} — 24 HRS
                </span>
              ))}
            </div>
          </div>

          {/* Right: Hotline Card */}
          <div className="relative z-10 lg:col-span-5 flex items-center justify-center p-7 sm:p-10 reveal-slide-right">
            <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-white/10 backdrop-blur-md p-6 sm:p-8">
              <div className="font-inter text-[11px] font-semibold uppercase tracking-wider text-white/70 mb-2">
                24 HRS Emergency Line
              </div>
              <a
                href="tel:+94452287800"
                className="block font-dm-sans font-bold text-2xl sm:text-3xl text-white tracking-tight hover:text-[#FECDD3] transition-colors mb-5"
              >
                +94 45 228 7800
              </a>
              <a
                href="tel:+94452287800"
                className="w-full inline-flex items-center justify-center gap-2.5 bg-white text-[#881337] hover:bg-rose-50 py-3.5 px-6 rounded-xl font-inter font-semibold text-sm shadow-lg transition-all active:scale-[0.98]"
              >
                <PhoneCall size={16} />
                Call the Emergency Line
              </a>
              <p className="font-inter text-[11px] text-white/60 mt-4 text-center">
                Answered day & night — all Poya days & holidays
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}