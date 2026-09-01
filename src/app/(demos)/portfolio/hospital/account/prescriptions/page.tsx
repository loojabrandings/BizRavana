'use client';

import React from 'react';
import {
  Pill,
  Download,
  Clock,
  Calendar,
  Stethoscope,
  FileText,
} from 'lucide-react';
import { usePatientData } from '../../hooks/usePatientData';

export default function PatientPrescriptionsPage() {
  const { prescriptions, loading } = usePatientData();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#102BDC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div>
          <h1 className="font-dm-sans font-bold text-2xl sm:text-3xl text-[#0D1527] mb-1">
            <span className="text-[#102BDC]">Prescription</span> History
          </h1>
          <p className="font-inter text-sm text-[#64748B]">
            View all your prescribed medications and dosage instructions.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 text-center">
          <p className="font-dm-sans font-bold text-2xl text-[#0D1527]">{prescriptions.length}</p>
          <p className="font-inter text-xs text-[#64748B]">Total Prescriptions</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 text-center">
          <p className="font-dm-sans font-bold text-2xl text-[#102BDC]">
            {prescriptions.reduce((acc, rx) => acc + rx.medications.length, 0)}
          </p>
          <p className="font-inter text-xs text-[#64748B]">Total Medications</p>
        </div>
      </div>

      {/* Prescriptions List */}
      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-12 text-center">
          <Pill size={48} className="text-[#94A3B8] mx-auto mb-4" />
          <h3 className="font-dm-sans font-bold text-lg text-[#0D1527] mb-2">
            No prescriptions yet
          </h3>
          <p className="font-inter text-sm text-[#64748B]">
            Your prescriptions will appear here after your consultations.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Prescription Header */}
              <div className="bg-[#F8FAFC] border-b border-slate-100 px-6 py-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#102BDC]/10 flex items-center justify-center">
                      <FileText size={18} className="text-[#102BDC]" />
                    </div>
                    <div>
                      <p className="font-dm-sans font-bold text-base text-[#0D1527]">{rx.doctor}</p>
                      <div className="flex items-center gap-2 text-xs font-inter text-[#64748B]">
                        <Calendar size={12} />
                        <span>{rx.date}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200/80 text-[#102BDC] font-inter font-medium text-xs hover:bg-[#102BDC]/5 transition-colors"
                  >
                    <Download size={14} />
                    Download PDF
                  </button>
                </div>
              </div>

              {/* Medications */}
              <div className="p-6">
                <div className="space-y-3">
                  {rx.medications.map((med, idx) => (
                    <div
                      key={idx}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 p-4 rounded-2xl bg-[#F8FAFC] border border-slate-100"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center flex-shrink-0">
                          <Pill size={14} className="text-emerald-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-dm-sans font-semibold text-sm text-[#0D1527]">
                            {med.name}
                          </p>
                          <p className="font-inter text-xs text-[#64748B]">{med.dosage}</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 sm:gap-4">
                        <div className="flex items-center gap-1.5">
                          <Clock size={12} className="text-[#94A3B8]" />
                          <span className="font-inter text-xs text-[#64748B]">{med.frequency}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar size={12} className="text-[#94A3B8]" />
                          <span className="font-inter text-xs text-[#64748B]">{med.duration}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notes */}
                {rx.notes && (
                  <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-200/50">
                    <p className="font-inter text-xs text-amber-700">
                      <span className="font-semibold">Doctor's Note:</span> {rx.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
