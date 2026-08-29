'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Building2, 
  Camera, 
  Sparkles, 
  Send, 
  Check, 
  ArrowUpRight,
  ShieldCheck,
  BadgePercent,
  Banknote
} from 'lucide-react';

export function RealEstateListProperty() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: 'Colombo 07',
    propertyType: 'Luxury House / Villa',
    expectedPrice: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <section id="list-property" className="relative w-full py-24 sm:py-32 bg-[#FAF9F6] text-[#141416] select-none">
      <div className="w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        
        {/* ── Main Seller Box (Two Columns) ────────────────────────── */}
        <div className="p-8 sm:p-14 lg:p-16 rounded-[2.5rem] bg-[#141416] text-white shadow-2xl overflow-hidden relative">
          
          {/* Subtle Background Glows */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* ── LEFT COLUMN: Seller Value Pitch (6 Cols) ─────────── */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 mb-4 backdrop-blur-md w-fit">
                <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white">
                  For Property Owners & Landlords
                </span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl text-white leading-[1.05] tracking-tight">
                <span className="re-font-sans font-light uppercase tracking-wider block text-xl sm:text-3xl text-white/70 mb-1">
                  Sell or Lease Your
                </span>
                <span className="re-font-serif font-normal text-4xl sm:text-6xl md:text-7xl tracking-tight block text-white">
                  Luxury Property Fast
                </span>
              </h2>

              <p className="mt-5 text-sm sm:text-base text-white/75 leading-relaxed font-light">
                List your residential or commercial asset with Sri Lanka&apos;s leading luxury agency. We connect you directly with pre-vetted corporate executives, diaspora investors, and high-net-worth buyers.
              </p>

              {/* 3 Step Selling Process */}
              <div className="mt-8 pt-8 border-t border-white/15 flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-[#C5A880] flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Complimentary Market Valuation</h4>
                    <p className="text-xs text-white/60 mt-0.5">Accurate current pricing guidance based on recent registered land transactions.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-[#C5A880] flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Architectural Media & Video Production</h4>
                    <p className="text-xs text-white/60 mt-0.5">High-end 4K video walkthroughs, drone footage, and editorial magazine staging.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-[#C5A880] flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Confidential Buyer Matching & Legal Escrow</h4>
                    <p className="text-xs text-white/60 mt-0.5">Discrete viewings exclusively with pre-qualified buyers and attorney deed coordination.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── RIGHT COLUMN: Quick Valuation & Listing Form (6 Cols) ── */}
            <div className="lg:col-span-6">
              <div className="p-7 sm:p-9 rounded-3xl bg-white text-[#141416] shadow-2xl border border-white/20">
                <h3 className="re-font-serif text-2xl sm:text-3xl font-normal text-[#141416] mb-1">
                  Request Free Property Valuation
                </h3>
                <p className="text-xs text-[#6E7178] mb-6">
                  Fill in your property details. Our senior broker will get in touch within 2 hours.
                </p>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center flex flex-col items-center justify-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-3">
                      <Check className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-bold text-emerald-900">Valuation Request Received</h4>
                    <p className="text-xs text-emerald-700 mt-1 max-w-xs">
                      Thank you! Our valuation specialist will contact you on your phone/WhatsApp promptly.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                      <label className="text-xs font-semibold text-[#141416] block mb-1.5 uppercase tracking-wider">
                        Your Full Name
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Roshan Perera"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] border border-[#E8E5DF] text-xs sm:text-sm text-[#141416] outline-none focus:border-[#141416] transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-[#141416] block mb-1.5 uppercase tracking-wider">
                          Phone / WhatsApp
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+94 77 123 4567"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] border border-[#E8E5DF] text-xs sm:text-sm text-[#141416] outline-none focus:border-[#141416] transition-colors"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#141416] block mb-1.5 uppercase tracking-wider">
                          Property District
                        </label>
                        <select
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] border border-[#E8E5DF] text-xs sm:text-sm text-[#141416] outline-none focus:border-[#141416] transition-colors cursor-pointer"
                        >
                          <option value="Colombo 07">Colombo 07</option>
                          <option value="Colombo 03">Colombo 03</option>
                          <option value="Rajagiriya">Rajagiriya</option>
                          <option value="Battaramulla">Battaramulla</option>
                          <option value="Galle Fort">Galle Fort / South Coast</option>
                          <option value="Kandy">Kandy / Hills</option>
                          <option value="Other">Other Region in Sri Lanka</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-[#141416] block mb-1.5 uppercase tracking-wider">
                          Property Type
                        </label>
                        <select
                          value={formData.propertyType}
                          onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] border border-[#E8E5DF] text-xs sm:text-sm text-[#141416] outline-none focus:border-[#141416] transition-colors cursor-pointer"
                        >
                          <option value="Luxury House / Villa">Luxury House / Villa</option>
                          <option value="Apartment / Penthouse">Apartment / Penthouse</option>
                          <option value="Beachfront Estate">Beachfront Estate</option>
                          <option value="Prime Commercial Land">Prime Residential Land</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-semibold text-[#141416] block mb-1.5 uppercase tracking-wider">
                          Expected Price (LKR)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 150 Mn"
                          value={formData.expectedPrice}
                          onChange={(e) => setFormData({ ...formData, expectedPrice: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-[#FAF9F6] border border-[#E8E5DF] text-xs sm:text-sm text-[#141416] outline-none focus:border-[#141416] transition-colors"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="mt-2 w-full py-4 rounded-xl bg-[#141416] hover:bg-[#2A2B30] text-white text-xs font-semibold tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Submit Valuation Request</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>

                    <p className="text-[11px] text-center text-[#6E7178] mt-1">
                      🔒 100% Confidential. Your personal information is never shared with third parties.
                    </p>
                  </form>
                )}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
