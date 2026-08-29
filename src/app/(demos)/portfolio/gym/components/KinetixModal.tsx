'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity, CheckCircle2, ArrowRight, ShieldCheck, QrCode, Calendar, Clock, User, Mail, Phone, Sparkles } from 'lucide-react';

interface KinetixModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSelection?: string;
}

export const KinetixModal: React.FC<KinetixModalProps> = ({
  isOpen,
  onClose,
  initialSelection = 'Full Biometric Diagnostic Assessment',
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedObjective, setSelectedObjective] = useState(initialSelection);
  const [athleteName, setAthleteName] = useState('');
  const [athleteEmail, setAthleteEmail] = useState('');
  const [athletePhone, setAthletePhone] = useState('');
  const [preferredDate, setPreferredDate] = useState('2026-09-02');
  const [preferredSlot, setPreferredSlot] = useState('08:00 AM (Morning Telemetry Session)');
  const [generatedPassId, setGeneratedPassId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialSelection) {
      setSelectedObjective(initialSelection);
    }
  }, [initialSelection]);

  const objectives = [
    'Full Biometric Diagnostic Assessment',
    'Pneumatic Torque & Eccentric Hypertrophy',
    'Neural Reflex & Cognitive Speed Pods',
    'Cryo-Hyperbaric Mitochondrial Recovery',
    'VO2 Max & Metabolic Spectrometry',
    'Custom Archetype Blueprint Calibrated',
  ];

  const handleInitialize = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      const randomCode = 'KX-' + Math.floor(1000 + Math.random() * 9000) + '-ALPHA';
      setGeneratedPassId(randomCode);
      setSubmitting(false);
      setStep(3); // Show Pass
    }, 1000);
  };

  const handleReset = () => {
    setStep(1);
    setAthleteName('');
    setAthleteEmail('');
    setAthletePhone('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-xl">
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.92 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-2xl rounded-3xl glass-panel bg-[#090b10] border border-white/15 p-6 sm:p-8 shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden font-mono-telemetry my-8"
      >
        {/* Corner Reticles */}
        <div className="absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 border-[#d4ff00]" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 border-[#d4ff00]" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 border-[#d4ff00]" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 border-[#d4ff00]" />

        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all border border-white/10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-white/10 mb-6">
          <div className="w-8 h-8 rounded-lg bg-[#d4ff00]/10 border border-[#d4ff00]/30 flex items-center justify-center text-[#d4ff00]">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-white/40 uppercase tracking-widest">
              KINETIX // LAB ACCESS DISPATCH
            </div>
            <div className="text-lg font-bold text-white font-display-futuristic">
              {step === 3 ? 'BIOMETRIC PASS ACTIVATED' : 'SCHEDULE LAB DIAGNOSTIC'}
            </div>
          </div>
        </div>

        {/* STEP 1: Select Objective / Protocol */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-xs text-white/60">
              Select your primary physiological focus area for diagnostic onboarding:
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {objectives.map((obj, i) => {
                const isSelected = selectedObjective.includes(obj) || obj.includes(selectedObjective);
                return (
                  <button
                    key={i}
                    onClick={() => setSelectedObjective(obj)}
                    className={`p-3.5 rounded-xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-[#d4ff00]/10 border-[#d4ff00] text-white shadow-[0_0_15px_rgba(212,255,0,0.15)] font-bold'
                        : 'bg-black/30 border-white/5 text-white/60 hover:text-white hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="truncate">{obj}</span>
                      {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#d4ff00]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3.5 rounded-xl bg-[#d4ff00] hover:bg-[#c2ea00] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(212,255,0,0.3)]"
              >
                <span>NEXT: ATHLETE DETAILS</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: Athlete Form */}
        {step === 2 && (
          <form onSubmit={handleInitialize} className="space-y-4">
            <div className="text-xs text-white/60 mb-2">
              Objective: <span className="text-[#d4ff00] font-bold">{selectedObjective}</span>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] text-white/50 uppercase flex items-center gap-1.5">
                <User className="w-3 h-3 text-[#d4ff00]" /> Full Athlete Name
              </label>
              <input
                type="text"
                required
                value={athleteName}
                onChange={(e) => setAthleteName(e.target.value)}
                placeholder="e.g. Alex Morgan"
                className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#d4ff00]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-white/50 uppercase flex items-center gap-1.5">
                  <Mail className="w-3 h-3 text-[#00f0ff]" /> Email Address
                </label>
                <input
                  type="email"
                  required
                  value={athleteEmail}
                  onChange={(e) => setAthleteEmail(e.target.value)}
                  placeholder="alex@performance.com"
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#00f0ff]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-white/50 uppercase flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-[#d4ff00]" /> Mobile / WhatsApp
                </label>
                <input
                  type="tel"
                  required
                  value={athletePhone}
                  onChange={(e) => setAthletePhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white placeholder-white/30 text-xs focus:outline-none focus:border-[#d4ff00]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-[11px] text-white/50 uppercase flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[#d4ff00]" /> Preferred Date
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#d4ff00]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] text-white/50 uppercase flex items-center gap-1.5">
                  <Clock className="w-3 h-3 text-[#00f0ff]" /> Time Window
                </label>
                <select
                  value={preferredSlot}
                  onChange={(e) => setPreferredSlot(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-black/50 border border-white/10 text-white text-xs focus:outline-none focus:border-[#00f0ff]"
                >
                  <option value="08:00 AM (Morning Telemetry Session)">08:00 AM (Morning Telemetry)</option>
                  <option value="12:00 PM (Mid-Day Peak Torque)">12:00 PM (Mid-Day Peak Torque)</option>
                  <option value="04:30 PM (Evening Lactate Lab)">04:30 PM (Evening Lactate Lab)</option>
                  <option value="07:00 PM (Night Cryo-Reset)">07:00 PM (Night Cryo-Reset)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-white/50 hover:text-white"
              >
                ← BACK
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3.5 rounded-xl bg-[#d4ff00] hover:bg-[#c2ea00] text-black font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(212,255,0,0.3)] disabled:opacity-50"
              >
                {submitting ? 'CALIBRATING PASS...' : 'CONFIRM & ISSUE ACCESS PASS'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Digital Biometric Pass Generated */}
        {step === 3 && (
          <div className="text-center space-y-6 py-2">
            <div className="w-16 h-16 rounded-2xl bg-[#d4ff00]/10 border border-[#d4ff00]/40 text-[#d4ff00] flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(212,255,0,0.3)]">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-2xl font-bold font-display-futuristic text-white">
                PASS CONFIRMED // ACCESS GRANTED
              </h3>
              <p className="text-xs text-white/60">
                Diagnostic reservation telemetry dispatched to <span className="text-white">{athleteEmail}</span>.
              </p>
            </div>

            {/* Futuristic Access Pass Hologram Box */}
            <div className="p-5 rounded-2xl bg-black/60 border border-[#d4ff00]/40 text-left font-mono-telemetry space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between text-xs pb-3 border-b border-white/10">
                <span className="text-white/40">DIGITAL NFC PASS ID:</span>
                <span className="text-[#d4ff00] font-bold text-sm tracking-widest">{generatedPassId}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-white/40 text-[10px]">ATHLETE:</span>
                  <div className="text-white font-bold">{athleteName}</div>
                </div>
                <div>
                  <span className="text-white/40 text-[10px]">RESERVATION:</span>
                  <div className="text-white font-bold">{preferredDate} @ {preferredSlot.slice(0, 8)}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-white/40 text-[10px]">DIAGNOSTIC FOCUS:</span>
                  <div className="text-[#00f0ff] font-bold truncate">{selectedObjective}</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-4 rounded-xl bg-[#d4ff00] text-black font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(212,255,0,0.3)]"
            >
              DONE // RETURN TO LAB PORTAL
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
