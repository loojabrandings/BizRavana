'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HeartPulse,
  Bed,
  Pill,
  Scan,
  Activity,
  Eye,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  PhoneCall,
} from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const SERVICES = [
  {
    id: 'opd-etu',
    num: '01',
    title: 'OPD & Emergency Treatment (ETU)',
    shortDesc: 'Round-the-clock immediate trauma triage, critical stabilization, and walk-in outpatient consultations.',
    category: 'Emergency 24/7',
    badge: 'Open Every Poya & Public Holiday',
    icon: HeartPulse,
    highlights: [
      '24/7 Resident medical officers & trained trauma nurses',
      'Immediate critical stabilization and resuscitation equipment',
      'Walk-in outpatient consultation active day and night',
    ],
    actionText: '24/7 Emergency Line: +94 45 228 7800',
    actionHref: 'tel:+94452287800',
    isEmergency: true,
  },
  {
    id: 'residential',
    num: '02',
    title: 'Inpatient & Residential Treatment',
    shortDesc: 'Seven dedicated residential care rooms featuring luxury suites, air-conditioned and standard private rooms.',
    category: 'Inpatient Care',
    badge: '24/7 Patient Admission',
    icon: Bed,
    highlights: [
      '2 Luxury executive inpatient suites',
      'Air-conditioned & regular private recovery rooms',
      'Round-the-clock continuous clinical monitoring',
    ],
    actionText: 'Inquire Inpatient Admission',
    actionHref: '#appointments',
  },
  {
    id: 'pharmacy',
    num: '03',
    title: '24/7 Indoor Hospital Pharmacy',
    shortDesc: 'Fully stocked hospital dispensary operating 365 days a year with prescription verification and emergency dispensing.',
    category: 'Pharmacy',
    badge: '24/7 Active',
    icon: Pill,
    highlights: [
      'Certified authentic pharmaceuticals & medical supplies',
      'Prescription support for OPD and admitted patients',
      'Open non-stop through all poya days and holidays',
    ],
    actionText: 'Call Pharmacy Desk',
    actionHref: 'tel:+94452287800',
  },
  {
    id: 'diagnostics',
    num: '04',
    title: 'Digital X-Ray, Scan & Automated Lab',
    shortDesc: 'High-resolution digital radiology, ultrasound diagnostic imaging, and fully automated pathology testing.',
    category: 'Diagnostics',
    badge: '24/7 Laboratory',
    icon: Scan,
    highlights: [
      'High-clarity digital X-Ray & ultrasound imaging',
      'Automated clinical biochemistry & hematology testing',
      'Emergency diagnostic reports with rapid turnaround',
    ],
    actionText: 'Book Diagnostic Investigation',
    actionHref: '#appointments',
  },
  {
    id: 'surgery',
    num: '05',
    title: 'Newly Opened Surgical Operating Theater',
    shortDesc: 'Modern sterile surgical facility equipped for laparoscopic, general, and specialist operative procedures.',
    category: 'Surgical Suite',
    badge: 'Modern Unit',
    icon: Activity,
    highlights: [
      'Laminar airflow sterile operating environment',
      'General, laparoscopic, and specialist surgeries',
      'Equipped post-operative recovery monitoring bay',
    ],
    actionText: 'Channel a Surgeon',
    actionHref: '#appointments',
  },
  {
    id: 'vision',
    num: '06',
    title: 'Vision Care & Cataract Surgery Unit',
    shortDesc: 'Comprehensive optometrist eye examinations, visual acuity testing, and specialized cataract surgeries.',
    category: 'Eye Care',
    badge: 'Specialized Clinic',
    icon: Eye,
    highlights: [
      'Certified optometrist vision testing & refraction',
      'Micro-incision cataract surgical procedures',
      'Visiting consultant eye surgeon channelling clinic',
    ],
    actionText: 'Channel Eye Specialist',
    actionHref: '#appointments',
  },
];

export function LifeCareServices() {
  const ref = useScrollReveal();
  const [activeIdx, setActiveIdx] = useState(0);
  const activeService = SERVICES[activeIdx];
  const ActiveIcon = activeService.icon;

  return (
    <section
      id="services"
      ref={ref}
      className="w-full py-16 sm:py-24 bg-white relative overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16">
        
        {/* ── Section Header Row ──────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10 sm:mb-14 reveal-fade-up">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#102BDC]/10 border border-[#102BDC]/20 text-[#102BDC] text-xs font-semibold font-inter mb-3">
              <span className="w-2 h-2 rounded-full bg-[#102BDC] animate-pulse" />
              <span>Open 24/7 • All Poya Days & Public Holidays</span>
            </div>
            <h2 className="font-dm-sans font-bold text-3xl sm:text-4xl lg:text-[40px] text-[#0D1527] leading-[1.2] tracking-[-0.03em]">
              Our Clinical <span className="text-[#102BDC]">Services & Facilities</span>
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 lg:gap-6">
            <p className="font-inter text-sm sm:text-base text-[#475569] max-w-sm leading-relaxed">
              From round-the-clock trauma care to surgical suites and inpatient rooms.
            </p>

            <Link
              href="/portfolio/hospital/services"
              className="inline-flex items-center gap-2 bg-[#102BDC] hover:bg-[#0C22B0] text-white px-5 py-3 rounded-xl font-inter font-medium text-xs sm:text-sm whitespace-nowrap shadow-md shadow-[#102BDC]/20 transition-all group flex-shrink-0 active:scale-[0.98]"
            >
              <span>Explore All Services</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ── Unique Asymmetric Interactive Clinical Deck ─────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          
          {/* Left Column: Interactive Service Selector Tabs (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col gap-2.5 reveal-slide-left">
            {SERVICES.map((item, idx) => {
              const isSelected = idx === activeIdx;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveIdx(idx)}
                  onMouseEnter={() => setActiveIdx(idx)}
                  className={`w-full text-left p-4 sm:p-4.5 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 group ${
                    isSelected
                      ? 'bg-[#102BDC] text-white border-[#102BDC] shadow-lg shadow-[#102BDC]/20 scale-[1.01]'
                      : 'bg-[#F8FAFC] text-[#0D1527] border-slate-200/80 hover:bg-white hover:border-[#102BDC]/40 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className={`font-dm-sans font-bold text-xs sm:text-sm tracking-wider ${
                        isSelected ? 'text-white/80' : 'text-[#64748B]'
                      }`}
                    >
                      {item.num}
                    </span>

                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-white/15 text-white'
                          : 'bg-white border border-slate-200 text-[#102BDC] group-hover:bg-[#102BDC] group-hover:text-white'
                      }`}
                    >
                      <Icon size={18} strokeWidth={2} />
                    </div>

                    <div className="min-w-0">
                      <div
                        className={`font-dm-sans font-bold text-sm sm:text-[15px] leading-snug truncate ${
                          isSelected ? 'text-white' : 'text-[#0D1527] group-hover:text-[#102BDC]'
                        }`}
                      >
                        {item.title}
                      </div>
                      <div
                        className={`font-inter text-[11px] sm:text-xs truncate mt-0.5 ${
                          isSelected ? 'text-white/75' : 'text-[#64748B]'
                        }`}
                      >
                        {item.category}
                      </div>
                    </div>
                  </div>

                  <ArrowRight
                    size={16}
                    className={`flex-shrink-0 transition-transform ${
                      isSelected
                        ? 'text-white translate-x-1'
                        : 'text-slate-300 group-hover:text-[#102BDC] group-hover:translate-x-1'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right Column: Active Facility Stage Display (7 Cols) */}
          <div className="lg:col-span-7 bg-[#0D1527] text-white rounded-3xl p-6 sm:p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden shadow-2xl reveal-slide-right min-h-[420px]">
            {/* Ambient Deep Glow */}
            <div
              className="absolute -top-12 -right-12 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
              style={{ background: 'radial-gradient(circle, #102BDC 0%, #3B82F6 100%)' }}
            />

            {/* Top Row: Category Tag + Live Badge */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1 rounded-full text-xs font-inter font-medium text-white">
                <Sparkles size={14} className="text-[#60A5FA]" />
                <span>{activeService.category}</span>
              </div>

              <div className="inline-flex items-center gap-2 bg-[#102BDC]/40 border border-[#102BDC] px-3 py-1 rounded-full text-[11px] font-inter font-semibold text-[#93C5FD]">
                <ShieldCheck size={14} />
                <span>{activeService.badge}</span>
              </div>
            </div>

            {/* Middle Content: Title, Description & Clinical Highlights */}
            <div className="relative z-10 my-6">
              <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-[#60A5FA] mb-4 shadow-inner">
                <ActiveIcon size={24} strokeWidth={2} />
              </div>

              <h3 className="font-dm-sans font-bold text-2xl sm:text-3xl lg:text-[34px] text-white leading-tight tracking-[-0.02em] mb-3">
                {activeService.title}
              </h3>

              <p className="font-inter text-sm sm:text-base text-white/80 leading-relaxed max-w-xl mb-6">
                {activeService.shortDesc}
              </p>

              {/* Factual Highlights List */}
              <div className="space-y-2.5">
                {activeService.highlights.map((point, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={17} className="text-[#10B981] flex-shrink-0 mt-0.5" />
                    <span className="font-inter text-xs sm:text-sm text-white/90 leading-snug">
                      {point}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bottom Row: Direct Action Callout */}
            <div className="relative z-10 pt-5 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="font-inter text-xs text-white/60">
                Maintained 24/7 at Balangoda facility
              </div>

              <Link
                href={activeService.actionHref}
                className="inline-flex items-center justify-center gap-2.5 bg-[#102BDC] hover:bg-[#0C22B0] text-white px-6 py-3.5 rounded-xl font-inter font-semibold text-sm shadow-lg shadow-[#102BDC]/30 active:scale-[0.98] transition-all group"
              >
                {activeService.isEmergency && <PhoneCall size={16} />}
                <span>{activeService.actionText}</span>
                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
