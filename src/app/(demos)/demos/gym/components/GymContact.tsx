'use client';

import React from 'react';
import { ArrowUpRight, MessageSquare, Phone, Mail, Clock, MapPin } from 'lucide-react';

export const GymContact: React.FC = () => {
  return (
    <section id="contact" className="relative bg-[#050505] text-[#FEF9F5] py-24 sm:py-32 lg:py-36 overflow-hidden border-t border-white/10">
      
      {/* ── Ambient Background Lighting ─────────────────────── */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#CCFF00]/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        
        {/* ── Section Header ─────────────────────────────────── */}
        <div className="max-w-3xl mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-white/5 border border-[#CCFF00]/30 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#CCFF00]">
              VISIT US
            </span>
          </div>

          <h2 className="font-impact italic text-4xl sm:text-6xl lg:text-7xl uppercase leading-[0.95] text-[#FEF9F5] mb-5">
            YOUR STRONGER SELF <br />
            <span className="text-[#CCFF00]">STARTS HERE.</span>
          </h2>

          <p className="text-sm sm:text-base text-[#FEF9F5]/70 leading-relaxed font-normal max-w-2xl">
            Ready to take the next step? Come visit us, talk to our team and find the right way to start your fitness journey.
          </p>
        </div>

        {/* ── Editorial Asymmetric Layout (No Generic Cards) ─── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* Left Column: Location & Direct Inquiries (7 Cols) */}
          <div className="lg:col-span-7 space-y-10">
            
            {/* Location & Directions */}
            <div className="space-y-4 pb-8 border-b border-white/10">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#CCFF00]">
                <MapPin className="w-4 h-4" />
                <span>GYM LOCATION</span>
              </div>

              <p className="text-lg sm:text-xl font-semibold text-[#FEF9F5] leading-relaxed max-w-lg">
                50/15, Sumudu Uyana, Pubudu Mawatha, Mattegoda, Kottawa, Sri Lanka
              </p>

              <div className="pt-2">
                <a
                  href="https://maps.google.com/?q=Mattegoda,+Kottawa,+Sri+Lanka"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#FEF9F5] hover:text-[#CCFF00] transition-colors"
                >
                  <span className="border-b border-white/30 group-hover:border-[#CCFF00] pb-0.5 transition-colors">
                    GET DIRECTIONS
                  </span>
                  <ArrowUpRight className="w-4 h-4 text-[#CCFF00] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </div>
            </div>

            {/* Direct Contact Channels */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pb-8 border-b border-white/10">
              
              {/* Phone */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FEF9F5]/40">
                  <Phone className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>CALL US</span>
                </div>
                <a
                  href="tel:+94771234567"
                  className="font-impact italic text-2xl sm:text-3xl text-[#FEF9F5] hover:text-[#CCFF00] transition-colors block"
                >
                  +94 77 123 4567
                </a>
                <span className="text-xs text-[#FEF9F5]/50 block">Direct front-desk line</span>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FEF9F5]/40">
                  <Mail className="w-3.5 h-3.5 text-[#CCFF00]" />
                  <span>EMAIL</span>
                </div>
                <a
                  href="mailto:contact@pulsefitgym.com"
                  className="text-base sm:text-lg font-bold text-[#FEF9F5] hover:text-[#CCFF00] transition-colors block break-all pt-1"
                >
                  contact@pulsefitgym.com
                </a>
                <span className="text-xs text-[#FEF9F5]/50 block">Member support & inquiries</span>
              </div>

            </div>

            {/* Direct WhatsApp Action Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 p-6 sm:p-7 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-[#CCFF00]/40 transition-colors">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#CCFF00] block">
                  FASTEST RESPONSE
                </span>
                <h4 className="text-base sm:text-lg font-bold text-[#FEF9F5]">
                  Chat with our head trainer on WhatsApp
                </h4>
                <p className="text-xs text-[#FEF9F5]/60">
                  Instant answers on pricing, equipment, and personal coaching.
                </p>
              </div>

              <a
                href="https://wa.me/94771234567?text=Hello%20PulseFit,%20I%20would%20like%20to%20inquire%20about%20gym%20membership."
                target="_blank"
                rel="noopener noreferrer"
                className="group shrink-0 inline-flex items-center justify-center gap-2.5 bg-[#CCFF00] hover:bg-[#b8e600] text-black font-bold text-xs tracking-[0.15em] uppercase px-7 py-3.5 rounded-full transition-all duration-300 shadow-lg shadow-[#CCFF00]/20 hover:scale-105"
              >
                <MessageSquare className="w-4 h-4 fill-black" />
                <span>CHAT WITH US</span>
                <span className="transition-transform group-hover:translate-x-0.5">→</span>
              </a>
            </div>

          </div>

          {/* Right Column: Weekly Schedule Matrix (5 Cols) */}
          <div className="lg:col-span-5 bg-[#0a0a0a] border border-white/10 rounded-3xl p-8 sm:p-10">
            
            <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-8">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#CCFF00]">
                <Clock className="w-4 h-4" />
                <span>OPENING HOURS</span>
              </div>
              <div className="flex items-center gap-2 bg-[#CCFF00]/10 border border-[#CCFF00]/30 px-3 py-1 rounded-full">
                <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#CCFF00]">
                  OPEN TODAY
                </span>
              </div>
            </div>

            {/* Schedule List */}
            <div className="space-y-6">
              
              {/* Weekdays */}
              <div className="pb-5 border-b border-white/5 space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="font-impact italic text-xl sm:text-2xl uppercase tracking-tight text-[#FEF9F5]">
                    MONDAY – FRIDAY
                  </span>
                  <span className="text-xs uppercase font-bold tracking-wider text-[#CCFF00]">
                    WEEKDAYS
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#FEF9F5]/70">
                  5:00 AM – 10:00 PM
                </p>
              </div>

              {/* Saturday */}
              <div className="pb-5 border-b border-white/5 space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="font-impact italic text-xl sm:text-2xl uppercase tracking-tight text-[#FEF9F5]">
                    SATURDAY
                  </span>
                  <span className="text-xs uppercase font-bold tracking-wider text-[#FEF9F5]/40">
                    WEEKEND
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#FEF9F5]/70">
                  6:00 AM – 9:00 PM
                </p>
              </div>

              {/* Sunday */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                  <span className="font-impact italic text-xl sm:text-2xl uppercase tracking-tight text-[#FEF9F5]">
                    SUNDAY
                  </span>
                  <span className="text-xs uppercase font-bold tracking-wider text-[#FEF9F5]/40">
                    WEEKEND
                  </span>
                </div>
                <p className="text-sm font-semibold text-[#FEF9F5]/70">
                  7:00 AM – 6:00 PM
                </p>
              </div>

            </div>

            {/* Footnote */}
            <div className="pt-8 border-t border-white/10 mt-8">
              <p className="text-[11px] text-[#FEF9F5]/40 leading-relaxed font-normal">
                Holiday hours and special class schedules are posted in advance on our WhatsApp channel.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
