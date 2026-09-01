'use client';

import React, { useState } from 'react';
import { CalendarCheck, Clock, Plus } from 'lucide-react';
import { CHANNELING_SPECIALTIES } from '../channeling/data';
import { LifeCareChannelingModal } from './LifeCareChannelingModal';
import { useScrollReveal } from '../hooks/useScrollReveal';

export function LifeCareChannelingList() {
  const ref = useScrollReveal();
  const [openId, setOpenId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const bookingSpecialty = bookingId
    ? CHANNELING_SPECIALTIES.find((item) => item.id === bookingId) ?? null
    : null;

  return (
    <section
      id="specialties"
      ref={ref}
      className="w-full py-16 sm:py-24 bg-white relative overflow-hidden scroll-mt-20 border-t border-slate-200/80"
    >
      {/* Ghost numeral */}
      <div className="hidden lg:block absolute top-8 right-0 font-dm-sans font-bold text-[260px] leading-none text-[#0D1527]/[0.035] select-none pointer-events-none">
        08
      </div>

      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 relative">
        {/* Section Header */}
        <div className="max-w-2xl mb-10 sm:mb-14 reveal-fade-up">
          <div className="inline-flex items-center gap-1.5 bg-[#102BDC]/10 border border-[#102BDC]/20 px-3.5 py-1 rounded-full text-xs font-inter font-semibold text-[#102BDC] w-fit mb-4">
            <span className="w-2 h-2 rounded-full bg-[#102BDC] animate-pulse" />
            <span>The Panel — 08 Categories</span>
          </div>
          <h2 className="font-dm-sans font-bold text-2xl sm:text-3xl lg:text-[38px] text-[#0D1527] leading-[1.2] tracking-[-0.03em] mb-4">
            Pick a <span className="text-[#102BDC]">specialty.</span>
          </h2>
          <p className="font-inter font-normal text-sm sm:text-base text-[#475569] leading-[1.65]">
            Expand a card to see your dedicated consultant and the channeling
            times. Times can change — please call the hotline to confirm your
            slot before visiting.
          </p>
        </div>

        {/* Specialty Ledger */}
        <div className="border-t border-slate-200/80 reveal-fade-up">
          {CHANNELING_SPECIALTIES.map((item) => {
            const Icon = item.icon;
            const isOpen = openId === item.id;

            return (
              <div
                key={item.id}
                className="group relative border-b border-slate-200/70 transition-colors hover:bg-[#F8FAFC]"
              >
                {/* Hover glow sweep */}
                <span className="absolute left-0 top-0 h-full w-[2px] origin-top scale-y-0 group-hover:scale-y-100 bg-gradient-to-b from-[#102BDC] to-[#60A5FA] transition-transform duration-300" />

                {/* Specialty Row */}
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : item.id)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center gap-4 sm:gap-5 px-2 sm:px-4 py-5 text-left"
                >
                  <span className="font-dm-sans font-bold text-xs sm:text-sm text-[#94A3B8] group-hover:text-[#102BDC] transition-colors w-8 flex-shrink-0 tabular-nums">
                    {item.num}
                  </span>

                  <span className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border border-slate-200 text-[#102BDC] flex items-center justify-center flex-shrink-0 group-hover:bg-[#102BDC] group-hover:text-white group-hover:border-[#102BDC] transition-colors">
                    <Icon size={18} strokeWidth={2} />
                  </span>

                  <span className="flex-1 min-w-0">
                    <span className="block font-dm-sans font-bold text-base sm:text-lg text-[#0D1527] group-hover:text-[#102BDC] transition-colors truncate">
                      {item.specialty}
                    </span>
                    <span className="block font-inter text-[11px] sm:text-xs text-[#64748B] mt-1 truncate">
                      {item.tagline}
                    </span>
                  </span>

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

                {/* Expandable Panel — Photo full-height + Booking CTA */}
                <div className={`svc-panel ${isOpen ? 'open' : ''}`}>
                  <div className="svc-panel-inner">
                    <div className="px-2 sm:px-4 pb-6 pt-1 sm:pl-[68px]">
                      <div className="rounded-3xl overflow-hidden border border-slate-200/70 bg-white shadow-sm">
                        <div className="flex flex-col sm:flex-row">
                          {/* Doctor Photo — full height of the card */}
                          <div className="relative h-52 sm:h-auto sm:w-44 lg:w-52 flex-shrink-0 bg-slate-100">
                            {item.doctor.photo ? (
                              <img
                                src={item.doctor.photo}
                                alt={item.doctor.name}
                                loading="lazy"
                                decoding="async"
                                className="absolute inset-0 w-full h-full object-cover object-top"
                              />
                            ) : (
                              <div className="absolute inset-0 bg-gradient-to-br from-[#102BDC] to-[#4F46E5] flex items-center justify-center">
                                <span className="font-dm-sans font-bold text-5xl text-white">
                                  {item.doctor.initials}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0 p-5 sm:p-6">
                            <p className="font-inter text-[10px] uppercase tracking-[0.15em] text-[#94A3B8] mb-1">
                              Channeling Consultant
                            </p>
                            <h3 className="font-dm-sans font-bold text-lg sm:text-xl text-[#0D1527] leading-snug">
                              {item.doctor.name}
                            </h3>
                            <p className="font-inter text-[11px] sm:text-xs text-[#64748B] mt-1">
                              {item.doctor.designation} ·{' '}
                              {item.doctor.qualifications}
                            </p>

                            <div className="mt-4 flex items-start gap-2">
                              <Clock
                                size={15}
                                className="text-[#102BDC] flex-shrink-0 mt-0.5"
                              />
                              <div>
                                <span className="font-inter text-xs sm:text-sm text-[#475569] font-medium block">
                                  {item.doctor.sessions}
                                </span>
                                <span className="font-inter text-[10px] sm:text-[11px] text-[#94A3B8]">
                                  Times can change — the clinic will confirm
                                  your slot
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => setBookingId(item.id)}
                              className="mt-5 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#102BDC] hover:bg-[#0C22B0] text-white px-5 py-3 rounded-xl font-inter font-medium text-xs sm:text-sm shadow-md shadow-[#102BDC]/20 transition-all active:scale-[0.98]"
                            >
                              <CalendarCheck size={14} />
                              Make an Appointment
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Booking Modal */}
        <LifeCareChannelingModal
          specialty={bookingSpecialty}
          onClose={() => setBookingId(null)}
        />
      </div>
    </section>
  );
}