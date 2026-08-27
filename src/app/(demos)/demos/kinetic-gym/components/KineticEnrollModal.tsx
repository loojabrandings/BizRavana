'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Dumbbell, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

interface KineticEnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: string;
}

export function KineticEnrollModal({
  isOpen,
  onClose,
  initialPlan = 'Performance Plan ($39/mo)',
}: KineticEnrollModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(initialPlan);
  const [goal, setGoal] = useState('Muscle Building');
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (initialPlan) {
      setSelectedPlan(initialPlan);
    }
  }, [initialPlan]);

  // Lock background scroll when modal is active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      setIsSubmitted(false);
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;
    setIsSubmitted(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/85 backdrop-blur-xl"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
            className="relative w-full max-w-lg rounded-3xl bg-[#0D0D0D] border border-white/15 p-6 sm:p-8 shadow-2xl z-10 overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#E10600]/20 rounded-full blur-3xl pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 rounded-full bg-white/5 border border-white/10 text-[#9A9A9A] hover:text-white hover:bg-white/15 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {isSubmitted ? (
              /* Success State */
              <div className="flex flex-col items-center text-center py-8">
                <div className="w-16 h-16 rounded-full bg-[#E10600]/20 border border-[#E10600] flex items-center justify-center text-[#E10600] mb-4">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-bebas text-4xl text-white tracking-wider mb-2">
                  YOU ARE IN THE ZONE!
                </h3>
                <p className="font-poppins text-sm text-[#9A9A9A] font-light max-w-sm mb-6">
                  Thank you, <span className="text-white font-medium">{name}</span>! Our head coach has received your application for <span className="text-[#E10600] font-medium">{selectedPlan}</span> and will contact you via WhatsApp / email within 2 hours.
                </p>
                <button
                  onClick={onClose}
                  className="px-8 py-3 rounded-full bg-[#E10600] text-white font-poppins text-xs font-semibold uppercase tracking-wider shadow-lg shadow-[#E10600]/40 hover:scale-105 transition-transform"
                >
                  CLOSE & EXPLORE
                </button>
              </div>
            ) : (
              /* Enrollment Form */
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Dumbbell className="w-5 h-5 text-[#E10600] -rotate-45" />
                  <span className="font-poppins text-xs font-semibold tracking-widest text-[#E10600] uppercase">
                    Kinetic Membership Pass
                  </span>
                </div>

                <h3 className="font-bebas text-3xl sm:text-4xl text-white tracking-wide mb-1">
                  JOIN KINETIC GYM
                </h3>
                <p className="font-poppins text-xs text-[#9A9A9A] font-light mb-6">
                  Fill in your details below to activate your gym access or book a private session.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  {/* Selected Plan Display / Dropdown */}
                  <div>
                    <label className="block font-poppins text-[11px] font-medium text-[#9A9A9A] uppercase tracking-wider mb-1">
                      Selected Plan / Inquiry
                    </label>
                    <select
                      value={selectedPlan}
                      onChange={(e) => setSelectedPlan(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white font-poppins text-sm focus:outline-none focus:border-[#E10600] transition-colors"
                    >
                      <option value="Core Access (Rs. 6,500/mo)">Core Access (Rs. 6,500/mo)</option>
                      <option value="Performance Plan (Rs. 12,500/mo)">Performance Plan (Rs. 12,500/mo) - Most Popular in LK</option>
                      <option value="Elite Athlete (Rs. 24,500/mo)">Elite Athlete (Rs. 24,500/mo)</option>
                      <option value="1-on-1 Personal Training with Coach">1-on-1 Personal Training with Coach</option>
                      <option value="1-Day Colombo VIP Guest Pass">1-Day Colombo VIP Guest Pass</option>
                      <option value="General Inquiry">General Inquiry</option>
                    </select>
                  </div>

                  {/* Preferred Colombo Branch */}
                  <div>
                    <label className="block font-poppins text-[11px] font-medium text-[#9A9A9A] uppercase tracking-wider mb-1">
                      Preferred Colombo Hub
                    </label>
                    <select
                      className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white font-poppins text-sm focus:outline-none focus:border-[#E10600] transition-colors"
                    >
                      <option value="Colombo 07 - Cinnamon Gardens">Colombo 07 - Cinnamon Gardens (Main Arena)</option>
                      <option value="Colombo 03 - Kollupitiya">Colombo 03 - Kollupitiya (Express Hub)</option>
                    </select>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="block font-poppins text-[11px] font-medium text-[#9A9A9A] uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Kasun Perera"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white font-poppins text-sm focus:outline-none focus:border-[#E10600] placeholder:text-neutral-600 transition-colors"
                    />
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-poppins text-[11px] font-medium text-[#9A9A9A] uppercase tracking-wider mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        placeholder="kasun@example.lk"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white font-poppins text-sm focus:outline-none focus:border-[#E10600] placeholder:text-neutral-600 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block font-poppins text-[11px] font-medium text-[#9A9A9A] uppercase tracking-wider mb-1">
                        WhatsApp Number *
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="+94 77 123 4567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-black border border-white/15 text-white font-poppins text-sm focus:outline-none focus:border-[#E10600] placeholder:text-neutral-600 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Primary Fitness Goal */}
                  <div>
                    <label className="block font-poppins text-[11px] font-medium text-[#9A9A9A] uppercase tracking-wider mb-1">
                      Primary Fitness Goal
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Muscle Building', 'Fat Loss', 'Athletic Speed'].map((g) => (
                        <button
                          type="button"
                          key={g}
                          onClick={() => setGoal(g)}
                          className={`py-2 px-2 rounded-lg font-poppins text-[11px] font-medium border text-center transition-all ${
                            goal === g
                              ? 'bg-[#E10600]/20 border-[#E10600] text-white'
                              : 'bg-black/50 border-white/10 text-[#9A9A9A] hover:text-white'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full mt-3 py-3.5 rounded-full bg-[#E10600] text-white font-poppins text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#E10600]/40 hover:shadow-[#E10600]/70 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>CLAIM MEMBERSHIP PASS</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <p className="text-center font-poppins text-[10px] text-[#9A9A9A]">
                    🔒 Your information is secure. Instant 100% money back guarantee.
                  </p>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
