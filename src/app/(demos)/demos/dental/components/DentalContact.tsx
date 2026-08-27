'use client';

import React, { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
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
  const contactRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [treatment, setTreatment] = useState(TREATMENTS[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Parallax scrolling with spring smoothing
  const { scrollYProgress } = useScroll({
    target: contactRef,
    offset: ['start end', 'end start'],
  });

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 90, damping: 20, restDelta: 0.001 });

  const headerY = useTransform(smoothProgress, [0, 1], [50, -50]);
  const leftY = useTransform(smoothProgress, [0, 1], [70, -70]);
  const rightY = useTransform(smoothProgress, [0, 1], [-50, 50]);
  const bgGlowY = useTransform(smoothProgress, [0, 1], [-120, 120]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 500);
  };

  return (
    <section
      ref={contactRef}
      id="contact"
      className="relative w-full py-20 sm:py-28 lg:py-36 bg-[#FAFCFE]/60 backdrop-blur-md overflow-hidden select-none border-t border-slate-100/60 z-40"
    >
      {/* Background Subtle Accent with Parallax */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          style={{ y: bgGlowY }}
          className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[550px] h-[550px] bg-emerald-100/40 rounded-full blur-3xl opacity-70 will-change-transform"
        />
      </div>

      <div className="relative w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 z-10">
        
        {/* ── Section Header with Parallax & Viewport Entrance ── */}
        <motion.div
          style={{ y: headerY }}
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-10 sm:pb-14 lg:pb-16 border-b border-slate-200/80 will-change-transform"
        >
          <div className="flex flex-col items-start gap-3 sm:gap-4">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/60 text-xs font-semibold text-[#05c989] tracking-wider uppercase"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>CONTACT US</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="font-bold tracking-[-0.035em] text-[#111827] text-[30px] leading-[1.08] sm:text-[42px] sm:leading-[1.02] lg:text-[54px] lg:leading-[1.0]"
            >
              Get in Touch.<br />
              <span className="text-[#05c989]">We&apos;re Here in Colombo.</span>
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-[380px] text-left sm:text-right flex flex-col items-start sm:items-end gap-2"
          >
            <p className="text-slate-500 text-xs sm:text-sm lg:text-[14px] leading-relaxed font-normal">
              Have a question or looking to schedule a consultation? Reach out to our friendly Colombo clinic team.
            </p>
          </motion.div>
        </motion.div>

        {/* ── 2-Column Grid with Parallax ─────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 pt-8 sm:pt-14 items-start">
          
          {/* Left Column: Direct Info & Hours with Parallax (lg:col-span-5) */}
          <motion.div
            style={{ y: leftY }}
            className="col-span-1 lg:col-span-5 flex flex-col gap-6 sm:gap-8 will-change-transform"
          >
            
            {/* Contact Items */}
            <div className="flex flex-col gap-5 sm:gap-6">
              {CLINIC_DETAILS.map((item, idx) => {
                const IconC = item.icon;
                return (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-30px' }}
                    transition={{
                      duration: 0.45,
                      delay: 0.15 + idx * 0.08,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex items-start gap-4"
                  >
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
                  </motion.div>
                );
              })}
            </div>

            {/* Clean Opening Hours Box (Frosted Glassmorphism) */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.5, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="p-5 sm:p-6 rounded-2xl bg-white/60 backdrop-blur-2xl border border-white/80 shadow-lg flex flex-col gap-3"
            >
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
                <span>Sunday &amp; Poya Days</span>
                <span className="font-semibold text-emerald-600">Emergency Appointments Only</span>
              </div>
            </motion.div>

          </motion.div>

          {/* Right Column: Interactive Quick Inquiry Card (lg:col-span-7) */}
          <motion.div
            style={{ y: rightY }}
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="col-span-1 lg:col-span-7 rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/80 shadow-xl p-6 sm:p-10 flex flex-col gap-6 will-change-transform"
          >
            
            <div className="flex flex-col gap-1">
              <h3 className="text-xl sm:text-2xl font-bold text-[#111827] tracking-tight">
                Send a Quick Message
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 font-normal">
                Leave your contact details and our Colombo team will get back to you shortly.
              </p>
            </div>

            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-12 flex flex-col items-center justify-center text-center gap-3"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#05c989] flex items-center justify-center border border-emerald-200/60 shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-bold text-[#111827]">Message Received!</h4>
                <p className="text-xs sm:text-sm text-slate-500 max-w-[320px]">
                  Thank you, <strong>{name || 'valued patient'}</strong>. Our Colombo receptionist will contact you on <strong>{phone}</strong> shortly.
                </p>
                <button
                  type="button"
                  onClick={() => setIsSubmitted(false)}
                  className="mt-4 px-6 py-2 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:text-black hover:bg-slate-50"
                >
                  Send another inquiry
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                
                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kasun Perera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-slate-200/80 focus:border-[#05c989] focus:bg-white focus:outline-none text-xs sm:text-sm font-medium transition-colors shadow-2xs placeholder:text-slate-400"
                  />
                </div>

                {/* Phone */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Mobile Phone Number (Sri Lanka)
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 077 123 4567 or +94 77 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-slate-200/80 focus:border-[#05c989] focus:bg-white focus:outline-none text-xs sm:text-sm font-medium transition-colors shadow-2xs placeholder:text-slate-400"
                  />
                </div>

                {/* Treatment Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Interested Treatment
                  </label>
                  <select
                    value={treatment}
                    onChange={(e) => setTreatment(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl bg-white/80 border border-slate-200/80 focus:border-[#05c989] focus:bg-white focus:outline-none text-xs sm:text-sm font-medium transition-colors shadow-2xs text-slate-700 cursor-pointer"
                  >
                    {TREATMENTS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Submit Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto flex-1 py-3.5 rounded-full bg-[#111827] hover:bg-[#05c989] text-white text-xs sm:text-sm font-bold tracking-wide transition-all shadow-md hover:shadow-emerald-500/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer group disabled:opacity-50"
                  >
                    <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                    <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    type="button"
                    onClick={onOpenBooking}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-full bg-emerald-50 text-[#05c989] hover:bg-emerald-100/70 border border-emerald-200/60 text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Instant Booking</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </form>
            )}

          </motion.div>

        </div>

      </div>
    </section>
  );
}
