'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight, CalendarCheck, PhoneCall } from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const HOME_PATH = '/portfolio/hospital';

export function LifeCareDoctorsCTA() {
  const ref = useScrollReveal();

  return (
    <section
      ref={ref}
      className="w-full py-16 sm:py-24 bg-white relative overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        <div className="relative bg-[#102BDC] text-white rounded-3xl p-8 sm:p-12 lg:p-16 text-center overflow-hidden shadow-xl shadow-blue-900/15 reveal-fade-up">
          {/* Ambient Deep Glow */}
          <div
            className="absolute -top-16 left-1/2 -translate-x-1/2 w-[460px] h-[240px] rounded-full blur-[110px] opacity-30 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #60A5FA 0%, #3B82F6 100%)',
            }}
          />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-semibold font-inter mb-4 border border-white/20">
              <CalendarCheck size={13} />
              <span>Channelling & Appointments</span>
            </div>

            <h2 className="font-dm-sans font-bold text-2xl sm:text-3xl lg:text-[40px] text-white leading-[1.2] tracking-[-0.03em] mb-4">
              Found your <span className="text-[#93C5FD]">doctor?</span>
            </h2>

            <p className="font-inter text-sm sm:text-base text-white/80 max-w-xl mx-auto leading-relaxed mb-9">
              Book a consultation in advance — instant confirmation via SMS &
              WhatsApp. Or call us any time; our team will help you choose.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
              <Link
                href={`${HOME_PATH}#appointments`}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-white text-[#102BDC] hover:bg-slate-50 px-7 py-4 rounded-xl font-inter font-semibold text-sm shadow-lg transition-all active:scale-[0.98]"
              >
                Book an Appointment
                <ArrowUpRight size={16} />
              </Link>
              <a
                href="tel:+94452287800"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 border border-white/30 hover:bg-white/10 text-white px-7 py-4 rounded-xl font-inter font-medium text-sm transition-all"
              >
                <PhoneCall size={16} />
                Call +94 45 228 7800
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}