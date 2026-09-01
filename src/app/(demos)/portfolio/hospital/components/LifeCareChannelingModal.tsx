'use client';

import React, { useEffect, useState } from 'react';
import { CalendarCheck, CheckCircle2, PhoneCall, X } from 'lucide-react';
import type { ChannelingSpecialty } from '../channeling/data';

interface LifeCareChannelingModalProps {
  specialty: ChannelingSpecialty | null;
  onClose: () => void;
}

export function LifeCareChannelingModal({
  specialty,
  onClose,
}: LifeCareChannelingModalProps) {
  // Close on Escape + lock body scroll while open
  useEffect(() => {
    if (!specialty) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [specialty, onClose]);

  if (!specialty) return null;

  const doctor = specialty.doctor;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0D1527]/70 backdrop-blur-sm z-0"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl animate-fade-up max-h-[90dvh] overflow-y-auto">
        {/* Close Button — outside overflow containers for reliable clicks */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/90 hover:bg-white border border-white/50 text-[#0D1527] hover:text-rose-600 flex items-center justify-center transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <X size={18} strokeWidth={2.5} />
        </button>

        {/* Header — Doctor Identity */}
        <div className="relative bg-[#102BDC] text-white p-5 sm:p-6 overflow-hidden rounded-t-3xl">
          <div
            className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[60px] opacity-30 pointer-events-none"
            style={{
              background: 'radial-gradient(circle, #60A5FA 0%, #3B82F6 100%)',
            }}
          />

          <div className="relative z-10 flex items-center gap-4">
            {doctor.photo ? (
              <img
                src={doctor.photo}
                alt={doctor.name}
                className="w-14 h-14 rounded-xl object-cover object-top border border-white/30 flex-shrink-0"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-white/15 border border-white/30 flex items-center justify-center font-dm-sans font-bold text-lg flex-shrink-0">
                {doctor.initials}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-inter text-[10px] uppercase tracking-[0.15em] text-[#93C5FD] font-semibold mb-0.5">
                Channeling Request
              </p>
              <h3 className="font-dm-sans font-bold text-lg leading-snug">
                {doctor.name}
              </h3>
              <p className="font-inter text-[11px] text-white/75 mt-0.5 truncate">
                {specialty.specialty}
              </p>
            </div>
          </div>
        </div>

        {/* Appointment Form (keyed — fresh state per doctor) */}
        <ChannelingForm
          key={specialty.id}
          specialty={specialty}
          onClose={onClose}
        />
      </div>
    </div>
  );
}

function ChannelingForm({
  specialty,
  onClose,
}: {
  specialty: ChannelingSpecialty;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const doctor = specialty.doctor;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setSubmitted(true);
  };

  const formattedDate = date
    ? new Date(`${date}T00:00:00`).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <>
      {submitted ? (
        /* ── Success State ── */
        <div className="p-6 sm:p-8 text-center">
          <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={28} />
          </div>
          <h4 className="font-dm-sans font-bold text-xl text-[#0D1527] mb-2">
            Request received!
          </h4>
          <p className="font-inter text-sm text-[#475569] leading-relaxed mb-6">
            Thank you, <strong className="text-[#0D1527]">{name}</strong>. We
            have logged your channeling request for{' '}
            <strong className="text-[#0D1527]">{doctor.name}</strong>
            {formattedDate && (
              <>
                {' '}
                on <strong className="text-[#0D1527]">{formattedDate}</strong>
              </>
            )}
            . Our reception will confirm your slot via SMS &amp; WhatsApp
            shortly.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-[#102BDC] hover:bg-[#0C22B0] text-white py-3.5 rounded-xl font-inter font-semibold text-sm shadow-lg shadow-[#102BDC]/25 transition-all active:scale-[0.98]"
          >
            Done
          </button>
        </div>
      ) : (
        /* ── Appointment Form ── */
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          <div className="flex items-start gap-2 rounded-xl bg-[#F8FAFC] border border-slate-200/70 p-3">
            <CalendarCheck
              size={15}
              className="text-[#102BDC] flex-shrink-0 mt-0.5"
            />
            <p className="font-inter text-xs text-[#475569] leading-snug">
              {doctor.sessions}
            </p>
          </div>

          <div>
            <label
              htmlFor="svc-patient-name"
              className="block font-inter text-xs font-medium text-[#0D1527] mb-1.5"
            >
              Patient Name
            </label>
            <input
              id="svc-patient-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 font-inter text-sm text-[#0D1527] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#102BDC] focus:ring-2 focus:ring-[#102BDC]/15 transition"
            />
          </div>

          <div>
            <label
              htmlFor="svc-patient-phone"
              className="block font-inter text-xs font-medium text-[#0D1527] mb-1.5"
            >
              Phone Number
            </label>
            <input
              id="svc-patient-phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="07X XXX XXXX"
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 font-inter text-sm text-[#0D1527] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#102BDC] focus:ring-2 focus:ring-[#102BDC]/15 transition"
            />
          </div>

          <div>
            <label
              htmlFor="svc-patient-date"
              className="block font-inter text-xs font-medium text-[#0D1527] mb-1.5"
            >
              Preferred Date
            </label>
            <input
              id="svc-patient-date"
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 font-inter text-sm text-[#0D1527] focus:outline-none focus:border-[#102BDC] focus:ring-2 focus:ring-[#102BDC]/15 transition"
            />
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 bg-[#102BDC] hover:bg-[#0C22B0] text-white py-3.5 rounded-xl font-inter font-semibold text-sm shadow-lg shadow-[#102BDC]/25 transition-all active:scale-[0.98]"
          >
            <CalendarCheck size={15} />
            Confirm Channeling Request
          </button>

          <p className="font-inter text-[11px] text-[#94A3B8] text-center flex items-center justify-center gap-1.5">
            <PhoneCall size={11} />
            or call the hotline — +94 45 228 7800
          </p>
        </form>
      )}
    </>
  );
}