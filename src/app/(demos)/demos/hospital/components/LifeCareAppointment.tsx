'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Stethoscope,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { useScrollReveal } from '../hooks/useScrollReveal';

const SPECIALTIES = [
  'General Medicine & OPD',
  'Consultant Cardiology',
  'Pediatric & Child Health',
  'General & Laparoscopic Surgery',
  'Obstetrics & Gynaecology (VOG)',
  'Eye Care & Cataract Surgery',
  'Radiology & Ultrasound Scan',
];

const DOCTORS = [
  'Dr. H.M.M.S Bandaranayaka (Chief Consultant)',
  'Dr. Anura Wickramasinghe (Cardiologist)',
  'Dr. Samanthi Fernando (Pediatrician)',
  'Dr. Priyantha Dissanayake (Surgeon)',
  'Dr. Menaka Ratnayake (Consultant VOG)',
  'Dr. Kanishka Jayasuriya (Eye Surgeon)',
  'First Available Specialist Doctor',
];

export function LifeCareAppointment() {
  const ref = useScrollReveal();
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    specialty: SPECIALTIES[0],
    doctor: DOCTORS[0],
    date: '',
    timeSlot: 'Morning (08:30 AM - 12:00 PM)',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      name: '',
      phone: '',
      specialty: SPECIALTIES[0],
      doctor: DOCTORS[0],
      date: '',
      timeSlot: 'Morning (08:30 AM - 12:00 PM)',
      notes: '',
    });
  };

  return (
    <section
      id="appointments"
      ref={ref}
      className="w-full py-16 sm:py-24 bg-[#F8FAFC] border-y border-slate-200/80 relative overflow-hidden"
    >
      {/* Background Soft Accent Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.025]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `linear-gradient(#102BDC 1px, transparent 1px), linear-gradient(90deg, #102BDC 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-16 relative z-10">
        
        {/* ── Section Header ──────────────────────────────────────── */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 reveal-fade-up">
          <div className="inline-flex items-center gap-1.5 bg-[#102BDC]/10 border border-[#102BDC]/20 px-3.5 py-1 rounded-full text-xs font-inter font-semibold text-[#102BDC] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Channelling & Appointments</span>
          </div>

          <h2 className="font-dm-sans font-bold text-3xl sm:text-4xl lg:text-[40px] text-[#0D1527] leading-[1.2] tracking-[-0.03em] mb-4">
            Book a Specialist <span className="text-[#102BDC]">Consultation</span>
          </h2>

          <p className="font-inter text-sm sm:text-base text-[#475569] leading-relaxed">
            Reserve your clinical appointment with our specialist doctors in advance. Instant confirmation via SMS & WhatsApp.
          </p>
        </div>

        {/* ── 2-Column Booking Layout ─────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Direct Helpline & Booking Guarantee (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6 reveal-slide-left">
            
            {/* Direct Phone Channelling Card */}
            <div className="bg-[#102BDC] text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-900/15 relative overflow-hidden">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-semibold font-inter mb-4 border border-white/20">
                  <ShieldCheck size={14} />
                  <span>24/7 Telephone Booking</span>
                </div>

                <h3 className="font-dm-sans font-bold text-2xl sm:text-3xl text-white leading-tight mb-2">
                  Prefer Booking by Phone?
                </h3>

                <p className="font-inter text-xs sm:text-sm text-white/85 leading-relaxed mb-6">
                  Call our dedicated 24-hour channelling desk to reserve your specialist number right away.
                </p>

                <div className="space-y-3">
                  <a
                    href="tel:+94452287800"
                    className="w-full bg-white text-[#102BDC] hover:bg-slate-50 py-3.5 px-5 rounded-2xl flex items-center gap-3 font-dm-sans font-bold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#102BDC]/10 flex items-center justify-center text-[#102BDC] flex-shrink-0">
                      <PhoneCall size={18} strokeWidth={2.2} />
                    </div>
                    <span>+94 45 228 7800</span>
                  </a>

                  <a
                    href="tel:+94452287801"
                    className="w-full bg-white/10 hover:bg-white/20 border border-white/25 text-white py-3.5 px-5 rounded-2xl flex items-center gap-3 font-dm-sans font-bold text-base sm:text-lg transition-all"
                  >
                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white flex-shrink-0">
                      <PhoneCall size={18} strokeWidth={2.2} />
                    </div>
                    <span>+94 45 228 7801</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Why Book Online Checklist */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-sm space-y-4">
              <h4 className="font-dm-sans font-bold text-base sm:text-lg text-[#0D1527]">
                Appointment Highlights
              </h4>

              <ul className="space-y-3 font-inter text-xs sm:text-sm text-[#475569]">
                {[
                  'Instant digital SMS & WhatsApp slot verification',
                  'Priority consultation without prolonged waiting times',
                  'Direct access to 25+ resident & visiting medical specialists',
                  'Flexible rescheduling & cancellation support',
                ].map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <CheckCircle2 size={17} className="text-[#00A887] flex-shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right Column: Interactive Appointment Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-9 border border-slate-200/80 shadow-md shadow-slate-100 reveal-slide-right">
            {submitted ? (
              /* Success Confirmation View */
              <div className="py-12 flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-5 animate-scale-in">
                  <CheckCircle2 size={36} strokeWidth={2.5} />
                </div>

                <h3 className="font-dm-sans font-bold text-2xl sm:text-3xl text-[#0D1527] mb-2">
                  Appointment Request Received!
                </h3>

                <p className="font-inter text-sm text-[#64748B] max-w-md mb-6 leading-relaxed">
                  Thank you, <strong className="text-[#0D1527]">{formData.name || 'Patient'}</strong>. We have logged your consultation request for <strong className="text-[#102BDC]">{formData.doctor}</strong>. Our hospital reception will send a confirmation SMS to <strong className="text-[#0D1527]">{formData.phone}</strong> shortly.
                </p>

                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 sm:p-5 w-full max-w-md text-left space-y-2 mb-6 font-inter text-xs sm:text-sm">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-[#64748B]">Department:</span>
                    <span className="font-semibold text-[#0D1527]">{formData.specialty}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-[#64748B]">Date & Session:</span>
                    <span className="font-semibold text-[#0D1527]">{formData.date || 'Earliest Slot'} ({formData.timeSlot.split(' ')[0]})</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[#64748B]">Status:</span>
                    <span className="font-semibold text-emerald-600">Pending Staff Confirmation</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-[#102BDC] text-white hover:bg-[#0C22B0] px-7 py-3 rounded-xl font-inter font-medium text-sm transition-all"
                >
                  Book Another Appointment
                </button>
              </div>
            ) : (
              /* Booking Form View */
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="border-b border-slate-100 pb-3 mb-4">
                  <h3 className="font-dm-sans font-bold text-xl sm:text-2xl text-[#0D1527]">
                    Patient & Consultation Details
                  </h3>
                  <p className="font-inter text-xs sm:text-sm text-[#64748B]">
                    Please fill out the details below to reserve your appointment slot.
                  </p>
                </div>

                {/* Row 1: Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block font-inter font-medium text-xs sm:text-sm text-[#0D1527] mb-1.5">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        placeholder="e.g. Kasun Perera"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-3 text-sm font-inter text-[#0D1527] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#102BDC] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-inter font-medium text-xs sm:text-sm text-[#0D1527] mb-1.5">
                      Contact Number *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        required
                        placeholder="07X XXX XXXX"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-3 text-sm font-inter text-[#0D1527] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#102BDC] focus:bg-white transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Row 2: Specialty & Doctor */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block font-inter font-medium text-xs sm:text-sm text-[#0D1527] mb-1.5">
                      Medical Department *
                    </label>
                    <div className="relative">
                      <Stethoscope className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={formData.specialty}
                        onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-3 text-sm font-inter text-[#0D1527] focus:outline-none focus:border-[#102BDC] focus:bg-white transition-colors cursor-pointer"
                      >
                        {SPECIALTIES.map((spec, idx) => (
                          <option key={idx} value={spec}>
                            {spec}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-inter font-medium text-xs sm:text-sm text-[#0D1527] mb-1.5">
                      Specialist Consultant *
                    </label>
                    <select
                      value={formData.doctor}
                      onChange={(e) => setFormData({ ...formData, doctor: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl px-4 py-3 text-sm font-inter text-[#0D1527] focus:outline-none focus:border-[#102BDC] focus:bg-white transition-colors cursor-pointer"
                    >
                      {DOCTORS.map((doc, idx) => (
                        <option key={idx} value={doc}>
                          {doc}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Row 3: Date & Preferred Session */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                  <div>
                    <label className="block font-inter font-medium text-xs sm:text-sm text-[#0D1527] mb-1.5">
                      Preferred Date
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-3 text-sm font-inter text-[#0D1527] focus:outline-none focus:border-[#102BDC] focus:bg-white transition-colors cursor-pointer"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-inter font-medium text-xs sm:text-sm text-[#0D1527] mb-1.5">
                      Preferred Session Time
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={formData.timeSlot}
                        onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-3 text-sm font-inter text-[#0D1527] focus:outline-none focus:border-[#102BDC] focus:bg-white transition-colors cursor-pointer"
                      >
                        <option>Morning (08:30 AM - 12:00 PM)</option>
                        <option>Afternoon (01:00 PM - 04:30 PM)</option>
                        <option>Evening (05:00 PM - 08:30 PM)</option>
                        <option>Night OPD (24/7 Walk-in)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Row 4: Optional Notes */}
                <div>
                  <label className="block font-inter font-medium text-xs sm:text-sm text-[#0D1527] mb-1.5">
                    Medical Notes / Symptoms (Optional)
                  </label>
                  <div className="relative">
                    <MessageSquare className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3.5" />
                    <textarea
                      rows={2}
                      placeholder="Brief note on reason for visit..."
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200/80 rounded-xl pl-10 pr-4 py-3 text-sm font-inter text-[#0D1527] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#102BDC] focus:bg-white transition-colors resize-none"
                    />
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  className="w-full bg-[#102BDC] hover:bg-[#0C22B0] active:scale-[0.99] text-white py-4 px-6 rounded-2xl font-inter font-semibold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg shadow-[#102BDC]/25 transition-all group"
                >
                  <span>Confirm Appointment Reservation</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
