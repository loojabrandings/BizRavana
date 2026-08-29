'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useDemoToast } from '@/components/demos/DemoToastContext';

interface PackageOption {
  id: string;
  name: string;
  pricePerPerson: number;
  badge: string;
}

const PACKAGES: PackageOption[] = [
  { id: 'room-only', name: 'Room Only', pricePerPerson: 7000, badge: 'Stay Only' },
  { id: 'bb', name: 'Bed & Breakfast (BB)', pricePerPerson: 15000, badge: 'Most Popular' },
  { id: 'fb', name: 'Full Board (FB)', pricePerPerson: 25000, badge: 'All-Inclusive' },
];

export const VillaBooking: React.FC = () => {
  const { showDemoToast } = useDemoToast();

  // Form State
  const [selectedPackage, setSelectedPackage] = useState<string>('bb');
  const [checkIn, setCheckIn] = useState<string>('2026-09-10');
  const [checkOut, setCheckOut] = useState<string>('2026-09-12');
  const [guests, setGuests] = useState<number>(2);
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [specialRequest, setSpecialRequest] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Calculate Nights
  const calculateNights = (): number => {
    try {
      const d1 = new Date(checkIn);
      const d2 = new Date(checkOut);
      const diffTime = d2.getTime() - d1.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    } catch {
      return 1;
    }
  };

  const nights = calculateNights();
  const currentPkg = PACKAGES.find((p) => p.id === selectedPackage) || PACKAGES[1];
  const totalPrice = currentPkg.pricePerPerson * guests * nights;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      showDemoToast(
        'Reservation Inquired! 🌿',
        `Thank you ${fullName || 'Guest'}! Your booking request for ${guests} guests (${nights} nights, ${currentPkg.name}) has been sent to the Misty Peaks concierge.`
      );
    }, 600);
  };

  return (
    <section id="booking" className="relative py-20 sm:py-28 bg-transparent overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ── Section Header ── */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-18">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-mono font-bold tracking-widest uppercase mb-4"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            <span>Direct Reservation</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-[1.15]"
          >
            Check Availability &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-900 via-emerald-700 to-teal-700">
              Reserve Your Stay
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-600 font-light leading-relaxed max-w-xl mx-auto mt-4"
          >
            Book directly for instant confirmation, lowest guaranteed rates, and complimentary Ceylon welcome tea.
          </motion.p>
        </div>

        {/* ── Main Booking Layout (2-Column Bento Form & Live Summary) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start max-w-6xl mx-auto">
          {/* Left: Interactive Reservation Form (7 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/90 shadow-xl"
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 1. Stay Package Selection */}
              <div>
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-3">
                  1. Select Stay Package
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {PACKAGES.map((pkg) => {
                    const isSelected = selectedPackage === pkg.id;
                    return (
                      <button
                        type="button"
                        key={pkg.id}
                        onClick={() => setSelectedPackage(pkg.id)}
                        className={`p-3.5 rounded-2xl border text-left transition-all duration-300 cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50/70 border-emerald-600 shadow-md shadow-emerald-600/10'
                            : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span
                            className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full ${
                              isSelected
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {pkg.badge}
                          </span>
                        </div>
                        <h4 className="font-serif text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                          {pkg.name}
                        </h4>
                        <p className="text-[11px] font-semibold text-emerald-800 mt-1">
                          Rs. {pkg.pricePerPerson.toLocaleString()}
                          <span className="text-[9px] font-normal text-slate-500"> /person</span>
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Dates & Guests Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {/* Check In */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Check-In Date
                  </label>
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white transition-all cursor-pointer"
                    required
                  />
                </div>

                {/* Check Out */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Check-Out Date
                  </label>
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-medium focus:outline-none focus:border-emerald-600 focus:bg-white transition-all cursor-pointer"
                    required
                  />
                </div>

                {/* Guests */}
                <div>
                  <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Number of Guests
                  </label>
                  <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => setGuests(Math.max(1, guests - 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center justify-center cursor-pointer"
                    >
                      -
                    </button>
                    <span className="font-serif text-sm font-bold text-slate-900">
                      {guests} {guests === 1 ? 'Guest' : 'Guests'}
                    </span>
                    <button
                      type="button"
                      onClick={() => setGuests(Math.min(6, guests + 1))}
                      className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center justify-center cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. Guest Details */}
              <div className="space-y-4 pt-2 border-t border-slate-100">
                <label className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700">
                  2. Guest Contact Info
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <input
                      type="text"
                      placeholder="Your Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      placeholder="WhatsApp / Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <textarea
                    rows={2}
                    placeholder="Special requests (e.g. Airport/Train Pick-Up, Dietary preferences, Honeymoon decor)..."
                    value={specialRequest}
                    onChange={(e) => setSpecialRequest(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:bg-white transition-all resize-none"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="villa-btn-primary w-full py-4 rounded-full text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2.5 shadow-xl cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Checking Availability...</span>
                    </span>
                  ) : (
                    <>
                      <span>Check Availability &amp; Request Booking</span>
                      <span>→</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Right: Live Calculation & Direct Booking Summary Card (5 Cols) */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="lg:col-span-5 bg-gradient-to-b from-[#062b1e] to-[#041d14] rounded-3xl p-7 sm:p-9 text-white shadow-2xl space-y-6 relative overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-2 pb-5 border-b border-white/10">
              <span className="text-[10px] font-mono tracking-widest uppercase text-emerald-400 font-bold block">
                Stay Breakdown Summary
              </span>
              <h3 className="font-serif text-2xl font-bold text-white tracking-tight">
                Misty Peaks Cabana
              </h3>
              <p className="text-xs text-slate-300 font-light">
                Private Exclusive A-Frame Retreat • 360° Mist Views
              </p>
            </div>

            {/* Dynamic Summary Rows */}
            <div className="relative z-10 space-y-3.5 text-xs text-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Selected Package:</span>
                <span className="font-bold text-white text-right">{currentPkg.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Duration:</span>
                <span className="font-bold text-white">
                  {nights} {nights === 1 ? 'Night' : 'Nights'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Guests:</span>
                <span className="font-bold text-white">
                  {guests} {guests === 1 ? 'Person' : 'Persons'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Rate Calculation:</span>
                <span className="font-mono text-emerald-300">
                  Rs. {currentPkg.pricePerPerson.toLocaleString()} × {guests} × {nights}
                </span>
              </div>
            </div>

            {/* Total Estimated Price Display */}
            <div className="relative z-10 pt-5 border-t border-white/10 flex items-baseline justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 block">
                  Estimated Total
                </span>
                <span className="text-[11px] text-emerald-400/80 font-light">All taxes included</span>
              </div>
              <div className="text-right">
                <span className="font-serif text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Rs. {totalPrice.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="relative z-10 pt-4 space-y-2 border-t border-white/10 text-[11px] text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Instant Confirmation via WhatsApp Concierge</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>Free Date Rescheduling up to 48 Hours</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                <span>100% Exclusive Cabana Privacy (No Shared Guests)</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
