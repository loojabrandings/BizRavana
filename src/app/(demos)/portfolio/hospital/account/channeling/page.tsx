'use client';

import React from 'react';
import Link from 'next/link';
import {
  History,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  Stethoscope,
} from 'lucide-react';
import { usePatientData } from '../../hooks/usePatientData';

export default function PatientChannelingPage() {
  const { channelingHistory, loading } = usePatientData();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#102BDC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const completedSessions = channelingHistory.filter((ch) => ch.status === 'completed');
  const missedSessions = channelingHistory.filter((ch) => ch.status === 'no-show');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-dm-sans font-bold text-2xl sm:text-3xl text-[#0D1527] mb-1">
              <span className="text-[#102BDC]">Channeling</span> History
            </h1>
            <p className="font-inter text-sm text-[#64748B]">
              View all your past channeling sessions with specialist doctors.
            </p>
          </div>
          <a
            href="/portfolio/hospital/channeling"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#102BDC] text-white font-inter font-semibold text-sm hover:bg-[#0C22B0] transition-colors shadow-md shadow-[#102BDC]/25"
          >
            <Stethoscope size={16} />
            Book Channeling
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 text-center">
          <p className="font-dm-sans font-bold text-2xl text-[#0D1527]">{channelingHistory.length}</p>
          <p className="font-inter text-xs text-[#64748B]">Total Sessions</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 text-center">
          <p className="font-dm-sans font-bold text-2xl text-emerald-600">{completedSessions.length}</p>
          <p className="font-inter text-xs text-[#64748B]">Completed</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 text-center">
          <p className="font-dm-sans font-bold text-2xl text-amber-600">{missedSessions.length}</p>
          <p className="font-inter text-xs text-[#64748B]">No-Show</p>
        </div>
      </div>

      {/* Sessions List */}
      {channelingHistory.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-12 text-center">
          <History size={48} className="text-[#94A3B8] mx-auto mb-4" />
          <h3 className="font-dm-sans font-bold text-lg text-[#0D1527] mb-2">
            No channeling history
          </h3>
          <p className="font-inter text-sm text-[#64748B] mb-6">
            You haven't had any channeling sessions yet.
          </p>
          <a
            href="/portfolio/hospital/channeling"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#102BDC] text-white font-inter font-semibold text-sm hover:bg-[#0C22B0] transition-colors"
          >
            Book Your First Session
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {channelingHistory.map((ch) => (
            <div
              key={ch.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                {/* Icon */}
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    ch.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-600'
                      : ch.status === 'no-show'
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {ch.status === 'completed' ? (
                    <CheckCircle2 size={24} />
                  ) : ch.status === 'no-show' ? (
                    <AlertCircle size={24} />
                  ) : (
                    <XCircle size={24} />
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <h3 className="font-dm-sans font-bold text-lg text-[#0D1527] mb-1">
                        {ch.doctor}
                      </h3>
                      <p className="font-inter text-sm text-[#64748B] mb-1">{ch.specialty}</p>
                      <p className="font-inter text-xs text-[#94A3B8]">Date: {ch.date}</p>
                      {ch.notes && (
                        <p className="font-inter text-xs text-[#64748B] mt-2 italic bg-[#F8FAFC] rounded-xl px-3 py-2 border border-slate-100">
                          "{ch.notes}"
                        </p>
                      )}
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-col items-start sm:items-end gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                          ch.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50'
                            : ch.status === 'no-show'
                            ? 'bg-amber-50 text-amber-600 border border-amber-200/50'
                            : 'bg-rose-50 text-rose-600 border border-rose-200/50'
                        }`}
                      >
                        {ch.status}
                      </span>

                      {ch.status === 'completed' && (
                        <Link
                          href="/portfolio/hospital/channeling"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#102BDC] hover:bg-[#102BDC]/5 border border-[#102BDC]/20 transition-colors"
                        >
                          <RotateCcw size={13} />
                          Re-book
                        </Link>
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
