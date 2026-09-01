'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  XCircle,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react';
import { usePatientData } from '../../hooks/usePatientData';

type Tab = 'upcoming' | 'past';

export default function PatientAppointmentsPage() {
  const { upcomingAppointments, pastAppointments, cancelAppointment, loading } = usePatientData();
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#102BDC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const currentAppointments = activeTab === 'upcoming' ? upcomingAppointments : pastAppointments;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-dm-sans font-bold text-2xl sm:text-3xl text-[#0D1527] mb-1">
              My <span className="text-[#102BDC]">Appointments</span>
            </h1>
            <p className="font-inter text-sm text-[#64748B]">
              View and manage your upcoming and past appointments.
            </p>
          </div>
          <a
            href="/portfolio/hospital#appointments"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#102BDC] text-white font-inter font-semibold text-sm hover:bg-[#0C22B0] transition-colors shadow-md shadow-[#102BDC]/25"
          >
            <Calendar size={16} />
            Book New
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-1.5 inline-flex gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('upcoming')}
          className={`px-5 py-2.5 rounded-xl font-inter font-semibold text-sm transition-all duration-200 ${
            activeTab === 'upcoming'
              ? 'bg-[#102BDC] text-white shadow-md'
              : 'text-[#64748B] hover:bg-slate-50'
          }`}
        >
          Upcoming ({upcomingAppointments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('past')}
          className={`px-5 py-2.5 rounded-xl font-inter font-semibold text-sm transition-all duration-200 ${
            activeTab === 'past'
              ? 'bg-[#102BDC] text-white shadow-md'
              : 'text-[#64748B] hover:bg-slate-50'
          }`}
        >
          Past ({pastAppointments.length})
        </button>
      </div>

      {/* Appointment Cards */}
      {currentAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-12 text-center">
          <Calendar size={48} className="text-[#94A3B8] mx-auto mb-4" />
          <h3 className="font-dm-sans font-bold text-lg text-[#0D1527] mb-2">
            No {activeTab} appointments
          </h3>
          <p className="font-inter text-sm text-[#64748B] mb-6">
            {activeTab === 'upcoming'
              ? "You don't have any upcoming appointments scheduled."
              : "You don't have any past appointment records."}
          </p>
          {activeTab === 'upcoming' && (
            <a
              href="/portfolio/hospital#appointments"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#102BDC] text-white font-inter font-semibold text-sm hover:bg-[#0C22B0] transition-colors"
            >
              Book Your First Appointment
            </a>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {currentAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                {/* Date Block */}
                <div className="w-16 h-16 rounded-2xl bg-[#102BDC]/10 flex flex-col items-center justify-center flex-shrink-0">
                  <span className="font-inter text-[10px] font-semibold text-[#102BDC] uppercase tracking-wider">
                    {new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="font-dm-sans font-bold text-2xl text-[#102BDC] leading-none mt-0.5">
                    {new Date(apt.date).getDate()}
                  </span>
                  <span className="font-inter text-[10px] text-[#102BDC]/70">
                    {new Date(apt.date).getFullYear()}
                  </span>
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h3 className="font-dm-sans font-bold text-lg text-[#0D1527] mb-1">
                        {apt.doctor}
                      </h3>
                      <p className="font-inter text-sm text-[#64748B] mb-2">{apt.department}</p>
                      <div className="flex flex-wrap items-center gap-3 text-xs font-inter text-[#64748B]">
                        <span className="flex items-center gap-1.5">
                          <Clock size={13} className="text-[#94A3B8]" />
                          {apt.time}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <MapPin size={13} className="text-[#94A3B8]" />
                          LifeCare Hospitals
                        </span>
                      </div>
                      {apt.notes && (
                        <p className="font-inter text-xs text-[#64748B] mt-2 italic">
                          "{apt.notes}"
                        </p>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col items-start sm:items-end gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          apt.status === 'upcoming'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50'
                            : apt.status === 'completed'
                            ? 'bg-slate-100 text-slate-600'
                            : 'bg-rose-50 text-rose-600 border border-rose-200/50'
                        }`}
                      >
                        {apt.status === 'upcoming' && <CheckCircle2 size={12} />}
                        {apt.status === 'cancelled' && <XCircle size={12} />}
                        {apt.status === 'completed' && <CheckCircle2 size={12} />}
                        {apt.status}
                      </span>

                      {apt.status === 'upcoming' && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => cancelAppointment(apt.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 border border-rose-200/50 transition-colors"
                          >
                            <XCircle size={13} />
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#102BDC] hover:bg-[#102BDC]/5 border border-[#102BDC]/20 transition-colors"
                          >
                            <RotateCcw size={13} />
                            Reschedule
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
