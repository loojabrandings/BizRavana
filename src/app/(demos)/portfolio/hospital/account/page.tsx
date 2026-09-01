'use client';

import React from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  FileText,
  Pill,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { usePatientData } from '../hooks/usePatientData';

export default function PatientDashboardPage() {
  const {
    patient,
    upcomingAppointments,
    pendingResults,
    prescriptions,
    channelingHistory,
    loading,
  } = usePatientData();

  if (loading || !patient) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#102BDC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const recentPrescriptions = prescriptions.slice(0, 2);
  const recentChanneling = channelingHistory.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-dm-sans font-bold text-2xl sm:text-3xl text-[#0D1527] mb-1">
              Welcome back, <span className="text-[#102BDC]">{patient.name.split(' ')[0]}</span>
            </h1>
            <p className="font-inter text-sm text-[#64748B]">
              Here's an overview of your health portal.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm font-inter text-[#64748B]">
            <Activity size={16} className="text-emerald-500" />
            <span>Last visit: {recentChanneling[0]?.date || 'N/A'}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/portfolio/hospital/account/appointments"
          className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:shadow-md hover:border-[#102BDC]/30 transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#102BDC]/10 flex items-center justify-center mb-3">
            <Calendar size={20} className="text-[#102BDC]" />
          </div>
          <p className="font-dm-sans font-bold text-2xl text-[#0D1527]">
            {upcomingAppointments.length}
          </p>
          <p className="font-inter text-xs text-[#64748B] mt-0.5">Upcoming Appointments</p>
        </Link>

        <Link
          href="/portfolio/hospital/account/records"
          className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:shadow-md hover:border-amber-500/30 transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3">
            <AlertCircle size={20} className="text-amber-500" />
          </div>
          <p className="font-dm-sans font-bold text-2xl text-[#0D1527]">
            {pendingResults.length}
          </p>
          <p className="font-inter text-xs text-[#64748B] mt-0.5">Pending Lab Results</p>
        </Link>

        <Link
          href="/portfolio/hospital/account/prescriptions"
          className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:shadow-md hover:border-emerald-500/30 transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
            <Pill size={20} className="text-emerald-500" />
          </div>
          <p className="font-dm-sans font-bold text-2xl text-[#0D1527]">
            {prescriptions.length}
          </p>
          <p className="font-inter text-xs text-[#64748B] mt-0.5">Total Prescriptions</p>
        </Link>

        <Link
          href="/portfolio/hospital/account/channeling"
          className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 hover:shadow-md hover:border-purple-500/30 transition-all duration-200 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center mb-3">
            <FileText size={20} className="text-purple-500" />
          </div>
          <p className="font-dm-sans font-bold text-2xl text-[#0D1527]">
            {channelingHistory.length}
          </p>
          <p className="font-inter text-xs text-[#64748B] mt-0.5">Channeling Sessions</p>
        </Link>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-dm-sans font-bold text-lg text-[#0D1527]">Upcoming Appointments</h2>
            <Link
              href="/portfolio/hospital/account/appointments"
              className="font-inter text-xs text-[#102BDC] hover:text-[#0C22B0] font-medium flex items-center gap-1"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={32} className="text-[#94A3B8] mx-auto mb-3" />
              <p className="font-inter text-sm text-[#64748B]">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.map((apt) => (
                <div
                  key={apt.id}
                  className="flex items-center gap-4 p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#102BDC]/10 flex flex-col items-center justify-center flex-shrink-0">
                    <span className="font-inter text-[10px] font-semibold text-[#102BDC] uppercase">
                      {new Date(apt.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="font-dm-sans font-bold text-lg text-[#102BDC] leading-none">
                      {new Date(apt.date).getDate()}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-dm-sans font-semibold text-sm text-[#0D1527] truncate">
                      {apt.doctor}
                    </p>
                    <p className="font-inter text-xs text-[#64748B]">
                      {apt.department} · {apt.time}
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-inter text-[10px] font-semibold uppercase tracking-wider">
                    {apt.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Prescriptions */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-dm-sans font-bold text-lg text-[#0D1527]">Recent Prescriptions</h2>
            <Link
              href="/portfolio/hospital/account/prescriptions"
              className="font-inter text-xs text-[#102BDC] hover:text-[#0C22B0] font-medium flex items-center gap-1"
            >
              View all <ChevronRight size={14} />
            </Link>
          </div>

          {recentPrescriptions.length === 0 ? (
            <div className="text-center py-8">
              <Pill size={32} className="text-[#94A3B8] mx-auto mb-3" />
              <p className="font-inter text-sm text-[#64748B]">No prescriptions yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPrescriptions.map((rx) => (
                <div
                  key={rx.id}
                  className="p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={14} className="text-emerald-500" />
                    <span className="font-inter text-xs text-[#64748B]">{rx.date}</span>
                  </div>
                  <p className="font-dm-sans font-semibold text-sm text-[#0D1527] mb-1">
                    {rx.doctor}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {rx.medications.map((med, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-[#102BDC]/10 text-[#102BDC] font-inter text-[10px] font-medium"
                      >
                        {med.name} {med.dosage}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Channeling */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-dm-sans font-bold text-lg text-[#0D1527]">Recent Channeling Sessions</h2>
          <Link
            href="/portfolio/hospital/account/channeling"
            className="font-inter text-xs text-[#102BDC] hover:text-[#0C22B0] font-medium flex items-center gap-1"
          >
            View all <ChevronRight size={14} />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left font-inter text-[11px] font-semibold text-[#64748B] uppercase tracking-wider pb-3 pr-4">
                  Date
                </th>
                <th className="text-left font-inter text-[11px] font-semibold text-[#64748B] uppercase tracking-wider pb-3 pr-4">
                  Doctor
                </th>
                <th className="text-left font-inter text-[11px] font-semibold text-[#64748B] uppercase tracking-wider pb-3 pr-4">
                  Specialty
                </th>
                <th className="text-left font-inter text-[11px] font-semibold text-[#64748B] uppercase tracking-wider pb-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentChanneling.map((ch) => (
                <tr key={ch.id} className="border-b border-slate-50 last:border-0">
                  <td className="py-3.5 pr-4 font-inter text-sm text-[#0D1527]">{ch.date}</td>
                  <td className="py-3.5 pr-4 font-dm-sans font-medium text-sm text-[#0D1527]">
                    {ch.doctor}
                  </td>
                  <td className="py-3.5 pr-4 font-inter text-sm text-[#64748B]">{ch.specialty}</td>
                  <td className="py-3.5">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                        ch.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-600'
                          : ch.status === 'no-show'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {ch.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
