'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDemoToast } from '@/components/demos/DemoToastContext';

interface BranchInfo {
  id: string;
  name: string;
  isHeadBranch?: boolean;
  address: string;
  phone: string;
  hours: string;
  mapQuery: string;
}

export const SalonBookingSection: React.FC = () => {
  const { showDemoToast } = useDemoToast();
  const [selectedBranch, setSelectedBranch] = useState<string>('maharagama');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('Hair Botox Treatment');
  const [date, setDate] = useState('');

  const branches: BranchInfo[] = [
    {
      id: 'maharagama',
      name: 'Maharagama (Main Branch)',
      isHeadBranch: true,
      address: 'No, 2/A, Old Road, Maharagama',
      phone: '+94 71 581 6925',
      hours: 'Open Daily: 9:00 AM – 8:00 PM',
      mapQuery: 'Maharagama',
    },
    {
      id: 'nugegoda',
      name: 'Nugegoda Branch',
      address: 'High Level Road, Nugegoda',
      phone: '+94 71 581 6925',
      hours: 'Open Daily: 9:00 AM – 8:00 PM',
      mapQuery: 'Nugegoda',
    },
    {
      id: 'kottawa',
      name: 'Kottawa Branch',
      address: 'Pannipitiya Road, Kottawa',
      phone: '+94 71 581 6925',
      hours: 'Open Daily: 9:00 AM – 8:00 PM',
      mapQuery: 'Kottawa',
    },
  ];

  const currentBranch =
    branches.find((b) => b.id === selectedBranch) || branches[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    showDemoToast(
      'Appointment Request Received',
      `Thank you ${fullName || 'Guest'}! In production, this instantly redirects to WhatsApp with your booking details for ${currentBranch.name}.`
    );
  };

  return (
    <section
      id="booking"
      className="relative py-24 sm:py-36 bg-[#181818] text-[#F5F5F2] font-sans-clean overflow-hidden border-t border-white/5"
    >
      {/* Ambient Lighting */}
      <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#ECA53D]/10 blur-[180px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] rounded-full bg-[#C46A3B]/10 blur-[160px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.04] border border-[#ECA53D]/30 backdrop-blur-md mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#ECA53D] animate-pulse" />
            <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#ECA53D]">
              VISIT OR BOOK ONLINE
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-serif-luxury text-[#F5F5F2] leading-[1.15] mb-6"
          >
            Book Your Transformation.{' '}
            <span className="font-serif-luxury italic font-medium bg-gradient-to-r from-[#F5F5F2] via-[#F5D59A] to-[#ECA53D] bg-clip-text text-transparent">
              Visit Us Today.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-base text-[#F5F5F2]/75 max-w-2xl mx-auto leading-relaxed"
          >
            Experience premium unisex grooming & transformative care at your
            closest branch. Book in seconds via WhatsApp or call us directly.
          </motion.p>
        </div>

        {/* 2-Column Split: Left Branch Selector & Contacts | Right 1-Click WhatsApp Booking Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Column: 3 Branch Cards & Quick Connect */}
          <div className="lg:col-span-6 space-y-6">
            <h3 className="text-xl sm:text-2xl font-serif-luxury text-[#F5F5F2] mb-4">
              Select Your Preferred Branch
            </h3>

            {/* Branch Cards */}
            <div className="space-y-4">
              {branches.map((branch) => {
                const isSelected = selectedBranch === branch.id;
                return (
                  <button
                    key={branch.id}
                    type="button"
                    onClick={() => setSelectedBranch(branch.id)}
                    className={`w-full p-5 sm:p-6 rounded-3xl border text-left transition-all duration-300 flex items-start justify-between gap-4 ${
                      isSelected
                        ? 'bg-gradient-to-r from-white/[0.08] to-white/[0.03] border-[#ECA53D] shadow-2xl shadow-[#ECA53D]/15'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm sm:text-base font-bold text-[#F5F5F2]">
                          {branch.name}
                        </span>
                        {branch.isHeadBranch && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full bg-[#ECA53D] text-[#1C1C1C] font-extrabold uppercase tracking-wider">
                            Head Branch
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-[#F5F5F2]/70 flex items-center gap-1.5">
                        <span className="text-[#ECA53D]">📍</span>
                        <span>{branch.address}</span>
                      </p>

                      <p className="text-xs text-[#E2C391] flex items-center gap-1.5">
                        <span>🕒</span>
                        <span>{branch.hours}</span>
                      </p>
                    </div>

                    <div
                      className={`w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-all ${
                        isSelected
                          ? 'border-[#ECA53D] bg-[#ECA53D] text-[#1C1C1C]'
                          : 'border-white/30 text-transparent'
                      }`}
                    >
                      <span className="text-xs font-bold">✓</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Direct Connect Quick Actions */}
            <div className="p-6 rounded-3xl bg-white/[0.03] border border-white/10 space-y-4">
              <h4 className="text-xs uppercase tracking-widest font-bold text-[#ECA53D]">
                Direct Contact & Inquiries
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <a
                  href="tel:+94715816925"
                  onClick={(e) => {
                    e.preventDefault();
                    showDemoToast(
                      'Direct Call Trigger',
                      'Dialing Salon Boss Direct Line: +94 71 581 6925'
                    );
                  }}
                  className="px-4 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-[#F5F5F2] flex items-center justify-center gap-2 transition-all"
                >
                  <span>📞 Call: +94 71 581 6925</span>
                </a>

                <a
                  href="mailto:salonbossmaharagama@gmail.com"
                  onClick={(e) => {
                    e.preventDefault();
                    showDemoToast(
                      'Email Inquiry',
                      'Opening email to: salonbossmaharagama@gmail.com'
                    );
                  }}
                  className="px-4 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-semibold text-[#F5F5F2] flex items-center justify-center gap-2 transition-all truncate"
                >
                  <span>✉️ Email Us</span>
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: 1-Click WhatsApp Booking Form */}
          <div className="lg:col-span-6">
            <div className="p-6 sm:p-10 rounded-3xl bg-gradient-to-b from-[#1C1C1C] via-[#1C1C1C]/95 to-black border border-[#ECA53D]/30 shadow-2xl shadow-black/80 backdrop-blur-2xl">
              <div className="mb-6">
                <div className="text-xs uppercase tracking-[0.2em] font-bold text-[#ECA53D] mb-1">
                  1-Click Appointment Request
                </div>
                <h3 className="text-2xl sm:text-3xl font-serif-luxury text-[#F5F5F2]">
                  Reserve Your Spot
                </h3>
                <p className="text-xs text-[#F5F5F2]/65 mt-1">
                  Submitting directly sends your appointment request to Salon
                  Boss via WhatsApp for instant confirmation.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs uppercase font-bold tracking-wider text-[#F5F5F2]/80 mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dilani Perera"
                    className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/15 focus:border-[#ECA53D] focus:outline-none text-sm text-[#F5F5F2] placeholder-white/30 transition-colors"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-xs uppercase font-bold tracking-wider text-[#F5F5F2]/80 mb-1.5">
                    Phone / WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 071 581 6925"
                    className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/15 focus:border-[#ECA53D] focus:outline-none text-sm text-[#F5F5F2] placeholder-white/30 transition-colors"
                  />
                </div>

                {/* Service Selection */}
                <div>
                  <label className="block text-xs uppercase font-bold tracking-wider text-[#F5F5F2]/80 mb-1.5">
                    Select Service / Treatment
                  </label>
                  <select
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl bg-[#1C1C1C] border border-white/15 focus:border-[#ECA53D] focus:outline-none text-sm text-[#F5F5F2] transition-colors"
                  >
                    <option value="Hair Botox Treatment">Hair Botox Treatment (★ Signature 60% OFF)</option>
                    <option value="Keratin Smoothing Treatment">Keratin Smoothing Treatment</option>
                    <option value="Hair Colour & Balayage">Hair Colour & Balayage (★ 50% OFF)</option>
                    <option value="Haircut & Precision Styling">Haircut & Precision Styling</option>
                    <option value="Luxury Facial & Clean Up">Luxury Facial & Clean Up</option>
                    <option value="Ayurvedic Wellness & Steam">Ayurvedic Wellness & Steam</option>
                    <option value="Full Body Scrub">Full Body Scrub</option>
                  </select>
                </div>

                {/* Preferred Date */}
                <div>
                  <label className="block text-xs uppercase font-bold tracking-wider text-[#F5F5F2]/80 mb-1.5">
                    Preferred Date & Time
                  </label>
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    placeholder="e.g. This Saturday, 3:00 PM"
                    className="w-full px-4 py-3.5 rounded-2xl bg-white/[0.04] border border-white/15 focus:border-[#ECA53D] focus:outline-none text-sm text-[#F5F5F2] placeholder-white/30 transition-colors"
                  />
                </div>

                {/* Selected Branch Summary */}
                <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-xs">
                  <span className="text-white/60">Selected Location:</span>
                  <span className="font-bold text-[#ECA53D]">
                    {currentBranch.name}
                  </span>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 rounded-full bg-[#ECA53D] hover:bg-[#F5B453] text-[#1C1C1C] font-extrabold text-xs sm:text-sm uppercase tracking-widest border border-[#F5F5F2]/40 shadow-2xl shadow-[#ECA53D]/40 hover:shadow-[#ECA53D]/60 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
                  >
                    <span>CONFIRM BOOKING VIA WHATSAPP</span>
                    <span className="transition-transform group-hover:translate-x-1.5 font-sans">
                      →
                    </span>
                  </button>
                </div>

                <p className="text-[11px] text-[#F5F5F2]/50 text-center pt-1">
                  🔒 Fast response within 15 minutes during operating hours.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
