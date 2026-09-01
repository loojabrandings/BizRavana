'use client';

import React, { useState } from 'react';
import {
  FileText,
  Download,
  Eye,
  Clock,
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { usePatientData, type LabResult } from '../../hooks/usePatientData';

export default function PatientRecordsPage() {
  const { labResults, pendingResults, readyResults, loading } = usePatientData();
  const [expandedResult, setExpandedResult] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#102BDC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const toggleExpand = (id: string) => {
    setExpandedResult(expandedResult === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div>
          <h1 className="font-dm-sans font-bold text-2xl sm:text-3xl text-[#0D1527] mb-1">
            Medical <span className="text-[#102BDC]">Records</span>
          </h1>
          <p className="font-inter text-sm text-[#64748B]">
            Access your lab results, reports, and medical documents.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 text-center">
          <p className="font-dm-sans font-bold text-2xl text-emerald-600">{readyResults.length}</p>
          <p className="font-inter text-xs text-[#64748B]">Ready Results</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 text-center">
          <p className="font-dm-sans font-bold text-2xl text-amber-600">{pendingResults.length}</p>
          <p className="font-inter text-xs text-[#64748B]">Pending Results</p>
        </div>
      </div>

      {/* Pending Results Alert */}
      {pendingResults.length > 0 && (
        <div className="bg-amber-50 rounded-2xl border border-amber-200/50 p-4 flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-dm-sans font-semibold text-sm text-amber-800">
              {pendingResults.length} result{pendingResults.length > 1 ? 's' : ''} pending
            </p>
            <p className="font-inter text-xs text-amber-700 mt-0.5">
              {pendingResults.map((r) => r.testName).join(', ')} — Results will be available shortly.
            </p>
          </div>
        </div>
      )}

      {/* Lab Results List */}
      {labResults.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-12 text-center">
          <FlaskConical size={48} className="text-[#94A3B8] mx-auto mb-4" />
          <h3 className="font-dm-sans font-bold text-lg text-[#0D1527] mb-2">
            No medical records
          </h3>
          <p className="font-inter text-sm text-[#64748B]">
            Your lab results and reports will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {labResults.map((result) => (
            <div
              key={result.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Result Header */}
              <button
                type="button"
                onClick={() => result.status === 'ready' && toggleExpand(result.id)}
                className="w-full px-6 py-5 flex items-center gap-4 text-left"
                disabled={result.status === 'pending'}
              >
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    result.status === 'ready'
                      ? 'bg-emerald-50 text-emerald-600'
                      : 'bg-amber-50 text-amber-600'
                  }`}
                >
                  {result.status === 'ready' ? (
                    <FlaskConical size={22} />
                  ) : (
                    <Clock size={22} />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-dm-sans font-bold text-base text-[#0D1527] truncate">
                    {result.testName}
                  </h3>
                  <p className="font-inter text-xs text-[#64748B]">Date: {result.date}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                      result.status === 'ready'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/50'
                        : 'bg-amber-50 text-amber-600 border border-amber-200/50'
                    }`}
                  >
                    {result.status === 'ready' ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <Clock size={12} />
                    )}
                    {result.status}
                  </span>

                  {result.status === 'ready' && (
                    <div className="flex items-center gap-1">
                      {expandedResult === result.id ? (
                        <ChevronUp size={16} className="text-[#64748B]" />
                      ) : (
                        <ChevronDown size={16} className="text-[#64748B]" />
                      )}
                    </div>
                  )}
                </div>
              </button>

              {/* Expanded Results */}
              {result.status === 'ready' && expandedResult === result.id && result.values && (
                <div className="px-6 pb-6 border-t border-slate-100">
                  {/* Results Table */}
                  <div className="mt-4 overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="text-left font-inter text-[11px] font-semibold text-[#64748B] uppercase tracking-wider pb-3 pr-4">
                            Test
                          </th>
                          <th className="text-left font-inter text-[11px] font-semibold text-[#64748B] uppercase tracking-wider pb-3 pr-4">
                            Result
                          </th>
                          <th className="text-left font-inter text-[11px] font-semibold text-[#64748B] uppercase tracking-wider pb-3 pr-4">
                            Unit
                          </th>
                          <th className="text-left font-inter text-[11px] font-semibold text-[#64748B] uppercase tracking-wider pb-3">
                            Normal Range
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.values.map((val, idx) => {
                          // Simple out-of-range detection
                          const numVal = parseFloat(val.value);
                          const rangeMatch = val.normalRange.match(/([<>]?)\s*([\d.]+)/);
                          const isOutOfRange =
                            rangeMatch && rangeMatch[1] === '<'
                              ? numVal >= parseFloat(rangeMatch[2])
                              : rangeMatch && rangeMatch[1] === '>'
                              ? numVal <= parseFloat(rangeMatch[2])
                              : false;

                          return (
                            <tr key={idx} className="border-b border-slate-50 last:border-0">
                              <td className="py-3 pr-4 font-inter text-sm text-[#0D1527] font-medium">
                                {val.name}
                              </td>
                              <td className="py-3 pr-4">
                                <span
                                  className={`font-dm-sans font-bold text-sm ${
                                    isOutOfRange ? 'text-amber-600' : 'text-emerald-600'
                                  }`}
                                >
                                  {val.value}
                                </span>
                              </td>
                              <td className="py-3 pr-4 font-inter text-xs text-[#64748B]">
                                {val.unit}
                              </td>
                              <td className="py-3 font-inter text-xs text-[#94A3B8]">
                                {val.normalRange}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Download Button */}
                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#102BDC]/10 text-[#102BDC] font-inter font-medium text-xs hover:bg-[#102BDC]/20 transition-colors"
                    >
                      <Download size={14} />
                      Download Report
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
