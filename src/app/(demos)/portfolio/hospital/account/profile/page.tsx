'use client';

import React, { useState } from 'react';
import {
  User,
  Phone,
  Mail,
  Calendar,
  Droplet,
  Shield,
  Save,
  CheckCircle2,
  Heart,
} from 'lucide-react';
import { usePatientData, type Patient } from '../../hooks/usePatientData';

export default function PatientProfilePage() {
  const { patient, loading } = usePatientData();
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    bloodGroup: string;
    emergencyName: string;
    emergencyPhone: string;
    emergencyRelationship: string;
    insuranceProvider: string;
    insurancePolicy: string;
    insuranceExpiry: string;
  } | null>(null);

  React.useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        dateOfBirth: patient.dateOfBirth,
        bloodGroup: patient.bloodGroup,
        emergencyName: patient.emergencyContact.name,
        emergencyPhone: patient.emergencyContact.phone,
        emergencyRelationship: patient.emergencyContact.relationship,
        insuranceProvider: patient.insurance.provider,
        insurancePolicy: patient.insurance.policyNumber,
        insuranceExpiry: patient.insurance.expiry,
      });
    }
  }, [patient]);

  if (loading || !formData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#102BDC] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const inputClass =
    'w-full h-11 rounded-xl border border-slate-200 bg-white px-3.5 font-inter text-sm text-[#0D1527] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#102BDC] focus:ring-2 focus:ring-[#102BDC]/15 transition';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
        <div>
          <h1 className="font-dm-sans font-bold text-2xl sm:text-3xl text-[#0D1527] mb-1">
            Profile <span className="text-[#102BDC]">Settings</span>
          </h1>
          <p className="font-inter text-sm text-[#64748B]">
            Manage your personal information and preferences.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#102BDC]/10 flex items-center justify-center">
              <User size={18} className="text-[#102BDC]" />
            </div>
            <h2 className="font-dm-sans font-bold text-lg text-[#0D1527]">Personal Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div>
              <label className="block font-inter text-xs font-medium text-[#0D1527] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label className="block font-inter text-xs font-medium text-[#0D1527] mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label className="block font-inter text-xs font-medium text-[#0D1527] mb-1.5">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label className="block font-inter text-xs font-medium text-[#0D1527] mb-1.5">
                Date of Birth
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label className="block font-inter text-xs font-medium text-[#0D1527] mb-1.5">
                Blood Group
              </label>
              <div className="relative">
                <Droplet className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <select
                  value={formData.bloodGroup}
                  onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  className={`${inputClass} pl-10 cursor-pointer`}
                >
                  {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                    <option key={bg} value={bg}>
                      {bg}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
              <Heart size={18} className="text-rose-500" />
            </div>
            <h2 className="font-dm-sans font-bold text-lg text-[#0D1527]">Emergency Contact</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <div>
              <label className="block font-inter text-xs font-medium text-[#0D1527] mb-1.5">
                Contact Name
              </label>
              <input
                type="text"
                value={formData.emergencyName}
                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block font-inter text-xs font-medium text-[#0D1527] mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block font-inter text-xs font-medium text-[#0D1527] mb-1.5">
                Relationship
              </label>
              <select
                value={formData.emergencyRelationship}
                onChange={(e) => setFormData({ ...formData, emergencyRelationship: e.target.value })}
                className={`${inputClass} cursor-pointer`}
              >
                {['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other'].map((rel) => (
                  <option key={rel} value={rel}>
                    {rel}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Insurance Information */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#102BDC]/10 flex items-center justify-center">
              <Shield size={18} className="text-[#102BDC]" />
            </div>
            <h2 className="font-dm-sans font-bold text-lg text-[#0D1527]">Insurance Details</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            <div>
              <label className="block font-inter text-xs font-medium text-[#0D1527] mb-1.5">
                Insurance Provider
              </label>
              <input
                type="text"
                value={formData.insuranceProvider}
                onChange={(e) => setFormData({ ...formData, insuranceProvider: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block font-inter text-xs font-medium text-[#0D1527] mb-1.5">
                Policy Number
              </label>
              <input
                type="text"
                value={formData.insurancePolicy}
                onChange={(e) => setFormData({ ...formData, insurancePolicy: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className="block font-inter text-xs font-medium text-[#0D1527] mb-1.5">
                Expiry Date
              </label>
              <input
                type="date"
                value={formData.insuranceExpiry}
                onChange={(e) => setFormData({ ...formData, insuranceExpiry: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-2xl bg-[#102BDC] hover:bg-[#0C22B0] text-white font-inter font-semibold text-sm shadow-lg shadow-[#102BDC]/25 transition-all active:scale-[0.98]"
          >
            {saved ? (
              <>
                <CheckCircle2 size={16} />
                Saved Successfully
              </>
            ) : (
              <>
                <Save size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
