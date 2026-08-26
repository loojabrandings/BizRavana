'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface DentalContactProps {
  onOpenBooking?: () => void;
}

const CLINIC_DETAILS = [
  {
    icon: MapPin,
    title: 'Clinic Location',
    value: 'No. 42, Ward Place, Colombo 07',
    desc: 'Convenient parking available on-site',
  },
  {
    icon: Phone,
    title: 'Call or WhatsApp',
    value: '+94 11 268 9100',
    desc: 'Direct line & emergency on-call',
  },
  {
    icon: Mail,
    title: 'Email Us',
    value: 'care@lumident.lk',
    desc: 'Quick response within 2 hours',
  },
];

const TREATMENTS = [
  'General Checkup & Clean',
  'Teeth Whitening & Veneers',
  'Clear Aligners (Invisible Braces)',
  'Dental Implants',
  'Emergency Toothache Care',
];

export function DentalContact({ onOpenBooking }: DentalContactProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [treatment, setTreatment] = useState(TREATMENTS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 500);
  };

  return (
    <section id="contact" className="relative w-full py-20 sm:py-28 bg-[#FAFCFE]/60 backdrop-blur-md overflow-hidden select-none border-t border-slate-100/60 z-40">
      
      {/* Background Subtle Accent */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-50/50 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="relative w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 z-10">
        
        {/* ── Section Header ───────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-12 sm:pb-16 border-b border-slate-200/80">
          <div className="flex flex-col items-start gap-3.5 sm:gap-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/60 text-xs font-semibold text-[#05c989] tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CONTACT US</span>
            </div>

            <h2 className="font-bold tracking-[-0.035em] text-[#111827] text-[34px] leading-[1.05] sm:text-[46px] sm:leading-[1.02] lg:text-[54px] lg:leading-[1.0]">
              Get in Touch.<br />
              <span className="text-[#05c989]">We&apos;re Here in Colombo.</span>
            </h2>
          </div>

          <div className="max-w-[380px] text-left sm:text-right flex flex-col items-start sm:items-end gap-2">
            <p className="text-slate-500 text-xs sm:text-sm lg:text-[14px] leading-relaxed font-normal">
              Have a question or looking to schedule a consultation? Reach out to our friendly Colombo clinic team.
            </p>
          </div>
        </div>

        {/* ── 2-Column Grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-12 sm:pt-16 items-start">
          
          {/* Left Column: Direct Info & Hours (lg:col-span-5) */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            
            {/* Contact Items */}
            <div className="flex flex-col gap-6">
              {CLINIC_DETAILS.map((item) => {
                const IconC = item.icon;
                return (
                  <div key={item.title} className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-white/70 backdrop-blur-md border border-white/80 text-[#05c989] flex items-center justify-center shrink-0 shadow-xs">
                      <IconC className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {item.title}
                      </span>
                      <span className="font-bold text-base text-[#111827] mt-0.5">
                        {item.value}
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5">
                        {item.desc}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Clean Opening Hours Box (Frosted Glassmorphism) */}
            <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-lg flex flex-col gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#111827] uppercase tracking-wider pb-2 border-b border-slate-100">
                <Clock className="w-4 h-4 text-[#05c989]" />
                <span>Clinic Hours</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-slate-600">
                <span>Monday – Friday</span>
                <span className="font-semibold text-[#111827]">08:00 AM – 07:00 PM</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-slate-600">
                <span>Saturday</span>
                <span className="font-semibold text-[#111827]">09:00 AM – 04:00 PM</span>
              </div>
              <div className="flex justify-between text-xs sm:text-sm text-slate-600">
                <span>Sunday</span>
                <span className="font-semibold text-[#05c989]">Emergency On-Call</span>
              </div>
            </div>

          </div>

          {/* Right Column: Clean Direct Inquiry Form (lg:col-span-7 Frosted Glass) */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-white/65 backdrop-blur-2xl border border-white/80 shadow-[0_30px_90px_-20px_rgba(0,0,0,0.08)] p-8 sm:p-10">
              
              {isSubmitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-12 flex flex-col items-center text-center gap-4"
                >
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#05c989] flex items-center justify-center shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-2xl text-[#111827]">
                    Message Sent!
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 max-w-[340px] leading-relaxed">
                    Thank you {name}. Our clinic coordination team will contact you within 2 business hours.
                  </p>
                  <button
                    onClick={() => {
                      setIsSubmitted(false);
                      setName('');
                      setPhone('');
                    }}
                    className="mt-2 text-xs font-semibold text-[#05c989] hover:underline cursor-pointer"
                  >
                    Send another inquiry
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  <div className="flex flex-col">
                    <h3 className="font-bold text-xl sm:text-2xl text-[#111827] tracking-tight">
                      Quick Consultation Inquiry
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Fill out the form below or book directly online
                    </p>
                  </div>

                  {/* Name Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sarah Jenkins"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-white/80 bg-white/50 backdrop-blur-sm hover:bg-white/80 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#05c989] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Phone Input */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +41 79 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-white/80 bg-white/50 backdrop-blur-sm hover:bg-white/80 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#05c989] focus:border-transparent transition-all"
                    />
                  </div>

                  {/* Treatment Selector */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      Interested Treatment
                    </label>
                    <select
                      value={treatment}
                      onChange={(e) => setTreatment(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-white/80 bg-white/50 backdrop-blur-sm hover:bg-white/80 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#05c989] focus:border-transparent transition-all cursor-pointer"
                    >
                      {TREATMENTS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Submit CTA */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-2 w-full py-3.5 rounded-2xl bg-[#05c989] hover:bg-[#04b37a] disabled:bg-emerald-300 text-white font-semibold text-xs sm:text-sm transition-all shadow-md active:scale-98 flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    {isSubmitting ? (
                      <span>Sending...</span>
                    ) : (
                      <>
                        <span>Submit Inquiry</span>
                        <Send className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>

                  {/* Direct Online Scheduler Link */}
                  <div className="pt-2 text-center">
                    <span className="text-xs text-slate-400">Prefer instant booking? </span>
                    <button
                      type="button"
                      onClick={onOpenBooking}
                      className="text-xs font-semibold text-[#05c989] hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <span>Open Live Calendar</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
