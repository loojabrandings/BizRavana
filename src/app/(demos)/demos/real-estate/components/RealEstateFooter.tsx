'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  ArrowUpRight, 
  ShieldCheck, 
  Sparkles,
  Check
} from 'lucide-react';

export function RealEstateFooter() {
  const [bookingSent, setBookingSent] = useState(false);
  const [bookingData, setBookingData] = useState({
    name: '',
    contact: '',
    propertyInterest: 'Colombo 07 Mansion',
    preferredDate: '',
  });

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setBookingSent(true);
    setTimeout(() => setBookingSent(false), 5000);
  };

  return (
    <footer id="contact" className="relative w-full bg-[#141416] text-[#FAF9F6] pt-24 sm:pt-32 pb-16 select-none overflow-hidden">
      
      {/* ── Background Atmosphere Glows ────────────────────────────── */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C5A880]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-20">
        
        {/* ── Top Booking Scheduler Card ───────────────────────────── */}
        <div className="p-8 sm:p-12 lg:p-16 rounded-[2.5rem] bg-[#1E1F24] border border-white/10 shadow-2xl mb-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 mb-4 text-xs font-semibold uppercase tracking-wider text-[#C5A880]">
              <Calendar className="w-3.5 h-3.5" />
              <span>VIP Private Inspections</span>
            </div>

            <h3 className="re-font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-normal leading-tight">
              Schedule a Private Property Viewing
            </h3>

            <p className="mt-4 text-sm sm:text-base text-white/70 leading-relaxed font-light">
              Experience the craftsmanship and privacy firsthand with our senior broker concierge. Private chauffeured site visits available in Colombo and Galle.
            </p>

            <div className="mt-6 flex items-center gap-4 text-xs text-white/80">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Confidential Appointments</span>
              </span>
              <span className="w-1 h-1 rounded-full bg-white/30" />
              <span>Chauffeured Visits Available</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            {bookingSent ? (
              <div className="p-8 rounded-2xl bg-emerald-950/60 border border-emerald-500/30 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-3">
                  <Check className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-bold text-emerald-300">Viewing Appointment Scheduled</h4>
                <p className="text-xs text-emerald-400/80 mt-1 max-w-xs">
                  Our private client coordinator will contact you via WhatsApp to confirm the vehicle & time.
                </p>
              </div>
            ) : (
              <form onSubmit={handleBooking} className="flex flex-col gap-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <input
                    type="text"
                    required
                    placeholder="Your Full Name"
                    value={bookingData.name}
                    onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/15 text-xs sm:text-sm text-white placeholder:text-white/40 outline-none focus:border-[#C5A880] transition-colors"
                  />
                  <input
                    type="tel"
                    required
                    placeholder="WhatsApp Phone"
                    value={bookingData.contact}
                    onChange={(e) => setBookingData({ ...bookingData, contact: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/15 text-xs sm:text-sm text-white placeholder:text-white/40 outline-none focus:border-[#C5A880] transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <select
                    value={bookingData.propertyInterest}
                    onChange={(e) => setBookingData({ ...bookingData, propertyInterest: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl bg-[#25272D] border border-white/15 text-xs sm:text-sm text-white outline-none focus:border-[#C5A880] transition-colors cursor-pointer"
                  >
                    <option value="Colombo 07 Mansion">Colombo 07 Ward Place Mansion</option>
                    <option value="Rajagiriya Lakefront">Rajagiriya Diyawanna Lakefront</option>
                    <option value="Galle Fort Dutch Villa">Galle Fort Dutch Heritage Villa</option>
                    <option value="Kandy Mountain Sanctuary">Kandy Hanthana Sanctuary</option>
                    <option value="Colombo 03 Penthouse">Colombo 03 Sky Penthouse</option>
                    <option value="Custom Property Search">Custom Property Requirement</option>
                  </select>

                  <input
                    type="date"
                    required
                    value={bookingData.preferredDate}
                    onChange={(e) => setBookingData({ ...bookingData, preferredDate: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl bg-[#25272D] border border-white/15 text-xs sm:text-sm text-white outline-none focus:border-[#C5A880] transition-colors cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-white text-[#141416] hover:bg-[#FAF9F6] text-xs font-semibold tracking-wider uppercase transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <span>Confirm Viewing Request</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>

        </div>

        {/* ── Main Footer Link Columns ─────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 pb-16 border-b border-white/10">
          
          {/* Brand Info (4 Cols) */}
          <div className="lg:col-span-4">
            <Link href="/demos/real-estate" className="flex items-center gap-2.5 mb-5">
              <span className="w-3 h-3 rounded-full bg-[#C5A880]" />
              <span className="text-xl font-bold tracking-wider text-white uppercase">
                AURA <span className="re-font-serif italic font-normal text-[#C5A880] lowercase text-2xl">estates</span>
              </span>
            </Link>

            <p className="text-sm text-white/70 leading-relaxed font-light max-w-sm mb-6">
              Sri Lanka&apos;s foremost luxury real estate brokerage. Curating attorney-vetted architectural residences, colonial villas, and prime land assets for private buyers and generational families.
            </p>

            <div className="flex items-center gap-3">
              <a
                href="https://wa.me/94770000000"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-full bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold tracking-wide flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live WhatsApp: +94 77 000 0000</span>
              </a>
            </div>
          </div>

          {/* Colombo 07 Office (3 Cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs uppercase tracking-widest text-[#C5A880] font-semibold mb-4">
              Colombo Flagship Atelier
            </h4>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-white/75 leading-relaxed mb-3">
              <MapPin className="w-4 h-4 text-[#C5A880] flex-shrink-0 mt-0.5" />
              <span>Level 08, One Galle Face Tower, Colombo 02 / 42 Ward Place, Colombo 07, Sri Lanka</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-white/75 mb-2">
              <Phone className="w-4 h-4 text-[#C5A880]" />
              <span>+94 (11) 234 5678</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-white/75">
              <Mail className="w-4 h-4 text-[#C5A880]" />
              <span>colombo@auraestates.lk</span>
            </div>
          </div>

          {/* Galle Fort Office (3 Cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs uppercase tracking-widest text-[#C5A880] font-semibold mb-4">
              Southern Heritage Office
            </h4>
            <div className="flex items-start gap-2.5 text-xs sm:text-sm text-white/75 leading-relaxed mb-3">
              <MapPin className="w-4 h-4 text-[#C5A880] flex-shrink-0 mt-0.5" />
              <span>28 Church Street, Galle Fort, Southern Province, Sri Lanka</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-white/75 mb-2">
              <Phone className="w-4 h-4 text-[#C5A880]" />
              <span>+94 (91) 456 7890</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs sm:text-sm text-white/75">
              <Mail className="w-4 h-4 text-[#C5A880]" />
              <span>galle@auraestates.lk</span>
            </div>
          </div>

          {/* Quick Links (2 Cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs uppercase tracking-widest text-[#C5A880] font-semibold mb-4">
              Quick Links
            </h4>
            <ul className="flex flex-col gap-2.5 text-xs sm:text-sm text-white/70">
              <li>
                <a href="#signature-places" className="hover:text-white transition-colors">
                  Signature Places
                </a>
              </li>
              <li>
                <a href="#property-inventory" className="hover:text-white transition-colors">
                  Vetted Inventory
                </a>
              </li>
              <li>
                <a href="#locations" className="hover:text-white transition-colors">
                  Prime Locations
                </a>
              </li>
              <li>
                <a href="#why-us" className="hover:text-white transition-colors">
                  Title Deed Vetting
                </a>
              </li>
              <li>
                <a href="#list-property" className="hover:text-white transition-colors">
                  List Your Property
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* ── Bottom Legal Bar ─────────────────────────────────────── */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
          <p>© {new Date().getFullYear()} Aura Estates Private Brokerage Sri Lanka. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <span>Attorney Certified Bim Saviya Title Compliance</span>
            <Link href="/" className="text-[#C5A880] hover:underline">
              BizRavana Concept Demo
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
