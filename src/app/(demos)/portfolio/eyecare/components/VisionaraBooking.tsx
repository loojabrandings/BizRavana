'use client';

import React from 'react';
import { MapPin, Calendar, Clock, Phone, Send, CheckCircle2, MessageSquare } from 'lucide-react';
import { useVisionaraStore } from './VisionaraStore';

export function VisionaraBooking() {
  const {
    selectedBranch,
    setSelectedBranch,
    selectedService,
    setSelectedService,
    selectedTimeSlot,
    setSelectedTimeSlot,
    fullName,
    setFullName,
    phoneNumber,
    setPhoneNumber,
    isSubmitted,
    setIsSubmitted,
  } = useVisionaraStore();

  const branches = [
    {
      id: 'colombo',
      name: 'Colombo 07 Flagship',
      address: 'No. 42, Horton Place, Colombo 07',
      phone: '011 268 4500',
    },
    {
      id: 'kandy',
      name: 'Kandy City Center',
      address: 'Level 2, Kandy City Center, Kandy',
      phone: '081 223 9800',
    },
    {
      id: 'galle',
      name: 'Galle Fort Clinic',
      address: 'No. 18, Church Street, Galle Fort',
      phone: '091 224 5100',
    },
  ];

  const services = [
    'Full Digital Eye Checkup (Rs. 2,500)',
    'Computer & Screen Strain Check (Rs. 2,000)',
    'Children Vision Care (Rs. 2,000)',
    'Senior Glaucoma / Cataract Check (Rs. 3,500)',
    'Contact Lens Trial & Fitting (Rs. 1,500)',
    'Frame Selection & Prescription Fitting',
  ];

  const timeSlots = [
    'Morning (9:30 AM - 12:30 PM)',
    'Afternoon (1:30 PM - 4:30 PM)',
    'Evening (5:00 PM - 7:30 PM)',
    'Saturday / Sunday Weekend Slot',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fullName && phoneNumber) {
      setIsSubmitted(true);
    }
  };

  const branchData = branches.find((b) => b.id === selectedBranch) || branches[0];

  return (
    <section
      id="booking"
      className="relative w-full py-28 md:py-36 bg-[#080808] text-white px-6 md:px-14 lg:px-20 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto">
        {/* ── SECTION HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-950/60 border border-blue-800/40 text-[11px] font-bold tracking-[0.2em] text-blue-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>07 // APPOINTMENT PLANNER</span>
            </div>
            <h2 className="font-['Syne',sans-serif] text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-[1.1] text-white">
              Book Your Visit.
              <br />
              <span className="text-blue-400">Zero Waiting Time.</span>
            </h2>
          </div>

          <p className="text-sm md:text-base text-white/70 max-w-md leading-relaxed font-normal">
            Select your preferred clinic branch in Sri Lanka and book your slot in 30 seconds. No advance payment required.
          </p>
        </div>

        {/* ── INTERACTIVE BOOKING CONSOLE ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-zinc-950 border border-blue-900/40 p-8 md:p-12 shadow-2xl">
          {/* Left Form (7 cols) */}
          <div className="lg:col-span-7 space-y-8">
            {isSubmitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="font-['Syne',sans-serif] text-2xl font-bold uppercase text-white">
                  Appointment Confirmed!
                </h3>
                <p className="text-sm text-white/70 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{fullName}</strong>. We have reserved your slot at our{' '}
                  <strong>{branchData.name}</strong> for {selectedService}.
                </p>
                <p className="text-xs text-white/50">
                  Our clinic coordinator will send a confirmation SMS & WhatsApp message to{' '}
                  <strong>{phoneNumber}</strong> within 15 minutes.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false);
                    setFullName('');
                    setPhoneNumber('');
                  }}
                  className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  Book Another Appointment
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Step 1: Branch Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-blue-400 block">
                    1. SELECT CLINIC LOCATION
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {branches.map((b) => (
                      <button
                        type="button"
                        key={b.id}
                        onClick={() => setSelectedBranch(b.id)}
                        className={`p-3 text-left border text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                          selectedBranch === b.id
                            ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                            : 'bg-zinc-900/80 border-white/10 text-white/70 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 mb-1">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{b.name.split(' ')[0]}</span>
                        </div>
                        <span className="text-[10px] font-normal lowercase block opacity-70">
                          {b.name.split(' ').slice(1).join(' ')}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 2: Service Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-blue-400 block">
                    2. REASON FOR VISIT
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {services.map((svc, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setSelectedService(svc)}
                        className={`p-3 text-left border text-xs transition-all cursor-pointer ${
                          selectedService === svc
                            ? 'bg-blue-950/50 border-blue-500 text-blue-300 font-bold'
                            : 'bg-zinc-900/80 border-white/10 text-white/60 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        {svc}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 3: Preferred Time */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-blue-400 block">
                    3. PREFERRED TIME
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {timeSlots.map((slot, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`p-2.5 text-left border text-xs transition-all cursor-pointer ${
                          selectedTimeSlot === slot
                            ? 'bg-blue-950/50 border-blue-500 text-blue-300 font-bold'
                            : 'bg-zinc-900/80 border-white/10 text-white/60 hover:bg-zinc-800 hover:text-white'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step 4: Contact details */}
                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-1">
                        YOUR FULL NAME
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kasun Silva"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full p-3 bg-zinc-900 border border-white/20 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold uppercase tracking-wider text-white/60 block mb-1">
                        MOBILE NUMBER (SRI LANKA)
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. 077 123 4567"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="w-full p-3 bg-zinc-900 border border-white/20 text-white text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-['Syne',sans-serif] text-xs font-extrabold uppercase tracking-[0.2em] transition-colors shadow-xl flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <span>CONFIRM APPOINTMENT (NO PREPAYMENT)</span>
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Right Summary & Instant WhatsApp Box (5 cols) */}
          <div className="lg:col-span-5 p-6 bg-zinc-900 border border-white/10 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[10px] font-bold tracking-[0.25em] text-blue-400 uppercase font-mono">
                BRANCH SUMMARY
              </span>

              <h4 className="font-['Syne',sans-serif] text-2xl font-bold uppercase text-white">
                {branchData.name}
              </h4>

              <div className="space-y-3 text-xs text-white/70">
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{branchData.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Hotline: {branchData.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-white/50">
                  <Clock className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Mon - Sat: 8:30 AM - 7:00 PM | Sun: 9 AM - 2 PM</span>
                </div>
              </div>

              <div className="p-4 bg-zinc-950 border border-white/10 space-y-2 mt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 block">
                  WHAT TO EXPECT:
                </span>
                <p className="text-xs text-white/80 leading-relaxed">
                  ✓ Free parking available at all branches
                  <br />
                  ✓ Same-day lens cutting in our Colombo laboratory
                  <br />
                  ✓ All major Sri Lankan insurance cards accepted
                </p>
              </div>
            </div>

            {/* Instant WhatsApp Quick Connect */}
            <div className="p-4 bg-emerald-950/40 border border-emerald-600/40 space-y-3">
              <div className="flex items-center space-x-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                <MessageSquare className="w-4 h-4" />
                <span>Prefer to chat on WhatsApp?</span>
              </div>
              <p className="text-xs text-white/70">
                Message our friendly patient team directly on WhatsApp for instant booking or questions.
              </p>
              <a
                href="https://wa.me/94771234567?text=Hi%20Visionara,%20I%20would%20like%20to%20book%20an%20eye%20appointment."
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center w-full py-2.5 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-colors shadow-md"
              >
                CHAT ON WHATSAPP (+94 77 123 4567)
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
