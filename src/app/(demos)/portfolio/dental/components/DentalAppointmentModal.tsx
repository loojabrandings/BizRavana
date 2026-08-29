'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  User,
  Phone,
  Mail,
  ShieldCheck,
  ArrowRight,
  Stethoscope,
  Smile,
  Zap,
} from 'lucide-react';

interface DentalAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TREATMENTS = [
  {
    id: 'general-checkup',
    name: 'General Checkup & Clean',
    category: 'Preventive Care',
    duration: '45 min',
    icon: Stethoscope,
  },
  {
    id: 'cosmetic-makeover',
    name: 'Cosmetic Veneers & Whitening',
    category: 'Smile Aesthetics',
    duration: '60 min',
    icon: Sparkles,
  },
  {
    id: 'aligners',
    name: 'Invisalign & Orthodontics',
    category: 'Teeth Alignment',
    duration: '45 min',
    icon: Smile,
  },
  {
    id: 'implants',
    name: 'Dental Implants & Surgery',
    category: 'Restorative Care',
    duration: '90 min',
    icon: Zap,
  },
];

const TIME_SLOTS = [
  '08:30 AM',
  '10:00 AM',
  '11:30 AM',
  '02:00 PM',
  '03:30 PM',
  '05:00 PM',
];

export function DentalAppointmentModal({ isOpen, onClose }: DentalAppointmentModalProps) {
  const [selectedTreatment, setSelectedTreatment] = useState(TREATMENTS[0].id);
  const [selectedDate, setSelectedDate] = useState('2026-08-28');
  const [selectedTime, setSelectedTime] = useState(TIME_SLOTS[1]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setName('');
    setPhone('');
    setEmail('');
    onClose();
  };

  const currentTreatmentObj = TREATMENTS.find((t) => t.id === selectedTreatment) || TREATMENTS[0];

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 overflow-y-auto select-none">
      
      {/* ── Frosted Dim Overlay ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xl transition-opacity"
      />

      {/* ── Modal Window Container ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
        className="relative w-full max-w-xl bg-white/95 backdrop-blur-3xl rounded-[32px] sm:rounded-[36px] shadow-[0_30px_100px_-20px_rgba(0,0,0,0.35)] border border-white/80 overflow-hidden text-slate-900 z-10 my-auto"
      >
        
        {/* Top Accent Refraction Line */}
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-400 via-[#05c989] to-teal-400" />

        {/* ── Modal Header ─────────────────────────────────────────── */}
        <div className="px-6 sm:px-8 pt-7 pb-5 border-b border-slate-100/80 flex items-center justify-between">
          <div className="flex flex-col items-start gap-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-[#05c989] border border-emerald-200/60 text-[11px] font-bold tracking-wider uppercase">
              <Sparkles className="w-3 h-3" />
              <span>DIRECT RESERVATION</span>
            </div>
            <h3 className="font-bold text-2xl text-[#111827] tracking-tight mt-1">
              Book Your Visit
            </h3>
            <p className="text-xs text-slate-500 font-normal">
              LUMIDENT Dental Center • No. 42, Ward Place, Colombo 07
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100/80 hover:bg-slate-200/80 flex items-center justify-center transition-colors text-slate-500 hover:text-slate-900 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Modal Content: Form or Success Pass ───────────────────── */}
        {isSubmitted ? (
          /* ── SUCCESS DIGITAL PASS ───────────────────────────────── */
          <div className="p-6 sm:p-8 flex flex-col items-center text-center gap-6">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-[#05c989] flex items-center justify-center ring-8 ring-emerald-50/60 shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="flex flex-col gap-1">
              <h4 className="text-2xl sm:text-3xl font-extrabold text-[#111827] tracking-tight">
                Appointment Reserved!
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md leading-relaxed">
                Thank you, <strong className="text-slate-800">{name || 'Patient'}</strong>. Our Colombo clinic team will call or WhatsApp <strong className="text-slate-800">{phone}</strong> shortly to confirm your appointment time.
              </p>
            </div>

            {/* Digital Clinic Pass Card */}
            <div className="w-full rounded-2xl bg-slate-50/80 border border-slate-200/80 p-5 flex flex-col gap-3.5 text-xs text-left shadow-xs">
              <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                <span className="text-slate-400 font-medium">Selected Treatment</span>
                <span className="font-bold text-[#111827] text-right">{currentTreatmentObj.name}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-200/60">
                <span className="text-slate-400 font-medium">Appointment Slot</span>
                <span className="font-bold text-[#05c989] text-right">{selectedDate} • {selectedTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 font-medium">Clinic Address</span>
                <span className="font-bold text-[#111827] text-right">No. 42, Ward Place, Colombo 07</span>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-4 bg-[#111827] hover:bg-[#05c989] text-white font-bold text-xs sm:text-sm rounded-2xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              Done & Return to Overview
            </button>
          </div>
        ) : (
          /* ── BOOKING FORM ───────────────────────────────────────── */
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 flex flex-col gap-6 max-h-[78vh] overflow-y-auto">
            
            {/* Step 1: Treatment Selection */}
            <div className="flex flex-col gap-2.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <span>1. Select Treatment</span>
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {TREATMENTS.map((treatment) => {
                  const isSelected = selectedTreatment === treatment.id;
                  const IconC = treatment.icon;

                  return (
                    <button
                      type="button"
                      key={treatment.id}
                      onClick={() => setSelectedTreatment(treatment.id)}
                      className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                        isSelected
                          ? 'border-[#05c989] bg-emerald-50/60 text-[#111827] ring-2 ring-[#05c989]/30 shadow-xs'
                          : 'border-slate-200/80 bg-white hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-[#05c989] text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        <IconC className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xs leading-snug">{treatment.name}</span>
                        <span className="text-[10px] text-slate-400 font-medium mt-0.5">{treatment.duration}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Date and Time Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Date Input */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#05c989]" />
                  <span>2. Preferred Date</span>
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#05c989] transition-all cursor-pointer"
                  required
                />
              </div>

              {/* Time Slot Picker */}
              <div className="flex flex-col gap-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#05c989]" />
                  <span>3. Time Slot</span>
                </label>
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#05c989] transition-all cursor-pointer"
                >
                  {TIME_SLOTS.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot} (Available)
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Step 3: Patient Contact Information */}
            <div className="flex flex-col gap-3 pt-1 border-t border-slate-100">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                4. Patient Details
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-600">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ruwan Perera"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#05c989] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-medium text-slate-600">Mobile / WhatsApp Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. 077 123 4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#05c989] transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-medium text-slate-600">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. ruwan@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#05c989] transition-all"
                />
              </div>
            </div>

            {/* Privacy & Guarantee Notice */}
            <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium bg-slate-50/80 p-3 rounded-xl border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-[#05c989] shrink-0" />
              <span>Strict Patient Confidentiality • Zero Spam Policy</span>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl bg-[#05c989] hover:bg-[#04b37a] text-white font-bold text-xs sm:text-sm transition-all shadow-lg hover:shadow-emerald-500/25 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Confirm &amp; Reserve Appointment</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>
        )}

      </motion.div>
    </div>
  );
}
