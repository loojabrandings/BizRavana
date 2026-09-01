'use client';

import React, { useMemo, useState } from 'react';
import { CheckCircle2, PhoneCall, Plus } from 'lucide-react';
import {
  HOSPITAL_SERVICES,
  SERVICE_CATEGORIES,
  type ServiceCategoryId,
} from '../services/data';
import { useScrollReveal } from '../hooks/useScrollReveal';

type Filter = ServiceCategoryId | 'all';

const FILTERS: Array<{ id: Filter; label: string; num: string }> = [
  { id: 'all', label: 'All Services', num: '01' },
  { id: 'emergency', label: 'Emergency & 24/7', num: '02' },
  { id: 'tests', label: 'Scans & Tests', num: '03' },
  { id: 'surgery', label: 'Surgery & Theatre', num: '04' },
  { id: 'specialist', label: 'Special Care Units', num: '05' },
  { id: 'family', label: 'Mother & Child', num: '06' },
  { id: 'everyday', label: 'Everyday Care', num: '07' },
];

export function LifeCareServicesDirectory() {
  const ref = useScrollReveal();
  const [activeCat, setActiveCat] = useState<Filter>('all');
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      activeCat === 'all'
        ? HOSPITAL_SERVICES
        : HOSPITAL_SERVICES.filter((service) => service.category === activeCat),
    [activeCat],
  );

  const countFor = (id: Filter) =>
    id === 'all'
      ? HOSPITAL_SERVICES.length
      : HOSPITAL_SERVICES.filter((service) => service.category === id).length;

  const selectCategory = (id: Filter) => {
    setActiveCat(id);
    setOpenId(null);
  };

  return (
    <section
      id="directory"
      ref={ref}
      className="w-full py-16 sm:py-24 bg-white relative overflow-hidden scroll-mt-20"
    >
      {/* Ghost numeral + ambient glow */}
      <div className="hidden lg:block absolute top-8 right-0 font-dm-sans font-bold text-[260px] leading-none text-[#0D1527]/[0.035] select-none pointer-events-none">
        27
      </div>
      <div className="absolute -left-40 top-1/4 w-[480px] h-[480px] rounded-full bg-[#102BDC]/[0.06] blur-[140px] pointer-events-none" />

      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* ── Left Rail: Title + Filters + Help ─────────────────── */}
          <aside className="lg:col-span-3 lg:sticky lg:top-28 self-start reveal-fade-up">
            <div className="inline-flex items-center gap-1.5 bg-[#102BDC]/10 border border-[#102BDC]/20 px-3.5 py-1 rounded-full text-xs font-inter font-semibold text-[#102BDC] w-fit mb-4">
              <span className="w-2 h-2 rounded-full bg-[#102BDC] animate-pulse" />
              <span>Directory — All 27 Units</span>
            </div>
            <h2 className="font-dm-sans font-bold text-2xl sm:text-3xl lg:text-[38px] text-[#0D1527] leading-[1.2] tracking-[-0.03em] mb-4">
              Find the care <span className="text-[#102BDC]">you need.</span>
            </h2>
            <p className="font-inter font-normal text-sm sm:text-base text-[#475569] leading-[1.65] mb-8 max-w-sm">
              All 27 services, written in simple words. Tap a row to read what
              it does and how to get it.
            </p>

            {/* Desktop Category Filters */}
            <div className="hidden lg:flex flex-col gap-2.5">
              {FILTERS.map((filter) => {
                const isActive = activeCat === filter.id;
                return (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => selectCategory(filter.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 group ${
                      isActive
                        ? 'bg-[#102BDC] text-white border-[#102BDC] shadow-lg shadow-[#102BDC]/20'
                        : 'bg-[#F8FAFC] text-[#0D1527] border-slate-200/80 hover:bg-white hover:border-[#102BDC]/40 hover:shadow-sm'
                    }`}
                  >
                    <span className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={`font-dm-sans font-bold text-xs sm:text-sm tracking-wider ${
                          isActive ? 'text-white/80' : 'text-[#94A3B8]'
                        }`}
                      >
                        {filter.num}
                      </span>
                      <span
                        className={`font-dm-sans font-bold text-sm sm:text-[15px] leading-snug truncate ${
                          isActive
                            ? 'text-white'
                            : 'text-[#0D1527] group-hover:text-[#102BDC]'
                        }`}
                      >
                        {filter.label}
                      </span>
                    </span>
                    <span
                      className={`font-dm-sans font-bold text-xs tabular-nums flex-shrink-0 ${
                        isActive ? 'text-white/80' : 'text-[#94A3B8]'
                      }`}
                    >
                      {String(countFor(filter.id)).padStart(2, '0')}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Help Card */}
            <div className="hidden lg:block mt-8 bg-[#102BDC]/10 border border-[#102BDC]/20 rounded-2xl p-5 relative overflow-hidden">
              <div className="font-inter text-[11px] font-semibold text-[#102BDC] uppercase tracking-wider mb-2">
                Need help choosing?
              </div>
              <p className="font-inter text-xs text-[#475569] leading-relaxed mb-4">
                One call is enough. Our team will guide you to the right unit.
              </p>
              <a
                href="tel:+94452287800"
                className="inline-flex items-center gap-2 bg-[#102BDC] hover:bg-[#0C22B0] text-white px-4 py-2.5 rounded-xl font-inter font-semibold text-xs shadow-md shadow-[#102BDC]/20 transition-colors"
              >
                <PhoneCall size={13} />
                +94 45 228 7800
              </a>
            </div>
          </aside>

          {/* ── Right: The 27-Unit Ledger ─────────────────────────── */}
          <div className="lg:col-span-9 min-w-0">
            {/* Mobile Category Chips */}
            <div className="lg:hidden flex gap-2 overflow-x-auto pb-5 svc-no-scrollbar reveal-fade-up">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  onClick={() => selectCategory(filter.id)}
                  className={`px-3.5 py-2 rounded-full border text-xs font-inter whitespace-nowrap transition-colors ${
                    activeCat === filter.id
                      ? 'bg-[#102BDC] border-[#102BDC] text-white'
                      : 'bg-white border-slate-200 text-[#475569]'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between mb-2 reveal-fade-up">
              <span className="font-inter text-xs text-[#64748B] tabular-nums">
                Showing {filtered.length} of {HOSPITAL_SERVICES.length} services
              </span>
              <span className="hidden sm:block font-inter text-xs text-[#94A3B8]">
                Tap a row for details
              </span>
            </div>

            <div className="border-t border-slate-200/80 reveal-fade-up">
              {filtered.map((service) => {
                const Icon = service.icon;
                const category = SERVICE_CATEGORIES.find(
                  (c) => c.id === service.category,
                )!;
                const isOpen = openId === service.id;

                return (
                  <div
                    key={service.id}
                    className="group relative border-b border-slate-200/70 transition-colors hover:bg-[#F8FAFC]"
                  >
                    {/* Hover glow sweep */}
                    <span className="absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 group-hover:scale-y-100 bg-gradient-to-b from-[#102BDC] to-[#60A5FA] transition-transform duration-300" />

                    {/* Ledger Row */}
                    <button
                      type="button"
                      onClick={() => setOpenId(isOpen ? null : service.id)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center gap-4 sm:gap-5 px-2 sm:px-4 py-5 text-left"
                    >
                      <span className="font-dm-sans font-bold text-xs sm:text-sm text-[#94A3B8] group-hover:text-[#102BDC] transition-colors w-8 flex-shrink-0 tabular-nums">
                        {service.num}
                      </span>

                      <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-slate-200 text-[#102BDC] flex items-center justify-center flex-shrink-0 group-hover:bg-[#102BDC] group-hover:text-white group-hover:border-[#102BDC] transition-colors">
                        <Icon size={18} strokeWidth={2} />
                      </span>

                      <span className="flex-1 min-w-0">
                        <span className="block font-dm-sans font-bold text-base sm:text-lg text-[#0D1527] group-hover:text-[#102BDC] transition-colors truncate">
                          {service.title}
                        </span>
                        <span className="block font-inter text-[11px] sm:text-xs text-[#64748B] mt-1">
                          {category.label}
                        </span>
                      </span>

                      {service.is24h && (
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-inter font-semibold text-[10px] uppercase tracking-[0.12em] flex-shrink-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F43F5E] animate-pulse" />
                          24 HRS
                        </span>
                      )}

                      <span
                        className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          isOpen
                            ? 'rotate-45 bg-[#102BDC] border-[#102BDC] text-white'
                            : 'border-slate-200 text-[#94A3B8] group-hover:text-[#102BDC] group-hover:border-[#102BDC]/40'
                        }`}
                      >
                        <Plus size={15} />
                      </span>
                    </button>

                    {/* Expandable Detail — Description + 3 Key Points (single column) */}
                    <div className={`svc-panel ${isOpen ? 'open' : ''}`}>
                      <div className="svc-panel-inner">
                        <div className="px-2 sm:px-4 pb-6 pt-1 sm:pl-[68px]">
                          <div className="rounded-2xl border border-slate-200/70 bg-[#F8FAFC] p-5 sm:p-6">
                            <p className="font-inter text-sm sm:text-[15px] text-[#475569] leading-relaxed">
                              {service.simple}
                            </p>
                            <ul className="mt-4 space-y-2.5">
                              {service.points.map((point) => (
                                <li
                                  key={point}
                                  className="flex items-start gap-2.5"
                                >
                                  <CheckCircle2
                                    size={16}
                                    className="text-[#102BDC] flex-shrink-0 mt-0.5"
                                  />
                                  <span className="font-inter text-xs sm:text-sm text-[#475569] leading-snug">
                                    {point}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}