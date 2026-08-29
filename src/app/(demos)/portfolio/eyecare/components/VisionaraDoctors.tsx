'use client';

import React from 'react';
import { Calendar, MapPin, Award, CheckCircle2, ArrowRight } from 'lucide-react';
import { useVisionaraStore } from './VisionaraStore';

interface DoctorProfile {
  id: string;
  name: string;
  title: string;
  qualification: string;
  experience: string;
  bio: string;
  clinicDays: { location: string; days: string; time: string }[];
  specialties: string[];
}

const doctors: DoctorProfile[] = [
  {
    id: 'dr-nimalka',
    name: 'Dr. Nimalka Jayawardena',
    title: 'Consultant Eye Surgeon & Specialist',
    qualification: 'MBBS (Colombo), MS Ophthalmology, FRCS (Edin)',
    experience: '22+ Years Experience',
    bio: 'Former senior eye specialist at National Eye Hospital Colombo. Renowned for gentle patient care, cataract diagnostics, and precision laser eye consultations.',
    clinicDays: [
      { location: 'Colombo 07 Flagship', days: 'Mon, Wed, Fri', time: '4:30 PM - 7:30 PM' },
      { location: 'Kandy City Center', days: 'Saturday', time: '9:00 AM - 1:00 PM' },
    ],
    specialties: ['Cataract & Glaucoma Care', 'Diabetic Retinopathy Check', 'Senior Eye Health'],
  },
  {
    id: 'dr-asela',
    name: 'Dr. Asela Perera',
    title: 'Senior Optometrist & Contact Lens Specialist',
    qualification: 'B.Optom (Hons), Fellow of International Contact Lens Educators (FIACLE)',
    experience: '14+ Years Experience',
    bio: 'Specializes in computer vision fatigue, dry-eye treatment, and custom astigmatism contact lens fitting with painless digital mapping.',
    clinicDays: [
      { location: 'Colombo 07 Flagship', days: 'Tue, Thu, Sat', time: '9:00 AM - 5:00 PM' },
      { location: 'Galle Fort Clinic', days: 'Sunday', time: '10:00 AM - 3:00 PM' },
    ],
    specialties: ['Computer Screen Strain', 'Custom Contact Lenses', 'High-Power Spectacle Fitting'],
  },
  {
    id: 'dr-sachini',
    name: 'Dr. Sachini Fernando',
    title: 'Pediatric Optometrist & Vision Development',
    qualification: 'B.Sc Optometry (Hons), Specialist in Childhood Myopia',
    experience: '9+ Years Experience',
    bio: 'Warm, patient, and beloved by young children. Helps school students overcome reading strain, eye-squinting, and myopia progression without fear.',
    clinicDays: [
      { location: 'Colombo 07 Flagship', days: 'Wed, Sat, Sun', time: '10:00 AM - 4:00 PM' },
      { location: 'Kandy City Center', days: 'Friday', time: '2:00 PM - 6:00 PM' },
    ],
    specialties: ['Children Vision Screening', 'Lazy Eye Therapy', 'Myopia Control Lenses'],
  },
];

export function VisionaraDoctors() {
  const { activeDoctorId, setActiveDoctorId } = useVisionaraStore();
  const activeDoctor = doctors.find((d) => d.id === activeDoctorId) || doctors[0];

  return (
    <section className="relative w-full py-28 md:py-36 bg-[#080808] text-white px-6 md:px-14 lg:px-20 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif] border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        {/* ── SECTION HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 md:mb-20 gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-950/60 border border-blue-800/40 text-[11px] font-bold tracking-[0.2em] text-blue-400 uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span>05 // OUR EYE SPECIALISTS</span>
            </div>
            <h2 className="font-['Syne',sans-serif] text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight uppercase leading-[1.1] text-white">
              Meet Sri Lanka’s
              <br />
              <span className="text-blue-400">Trusted Eye Doctors.</span>
            </h2>
          </div>

          <p className="text-sm md:text-base text-white/70 max-w-md leading-relaxed font-normal">
            Our doctors have cared for thousands of families across Sri Lanka. Friendly consultations in your preferred language.
          </p>
        </div>

        {/* ── DOCTOR SPOTLIGHT INTERACTIVE ACCORDION / ROSTER ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Doctor Navigation Selector (4 cols) */}
          <div className="lg:col-span-4 flex flex-col space-y-3 justify-center">
            {doctors.map((doc) => {
              const isSelected = doc.id === activeDoctor.id;
              return (
                <button
                  key={doc.id}
                  onClick={() => setActiveDoctorId(doc.id)}
                  className={`p-6 text-left border transition-all duration-200 group cursor-pointer ${
                    isSelected
                      ? 'bg-blue-950/50 border-blue-500 text-white shadow-xl'
                      : 'bg-zinc-950/80 border-white/10 text-white/70 hover:bg-zinc-900 hover:border-white/30 hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        isSelected ? 'text-blue-400' : 'text-zinc-500'
                      }`}
                    >
                      {doc.experience}
                    </span>
                    <ArrowRight
                      className={`w-4 h-4 transition-transform ${
                        isSelected ? 'translate-x-1 text-blue-400' : 'text-white/30'
                      }`}
                    />
                  </div>
                  <h3 className="font-['Syne',sans-serif] text-lg font-bold uppercase leading-tight">
                    {doc.name}
                  </h3>
                  <p
                    className={`text-xs mt-1 ${
                      isSelected ? 'text-blue-200 font-medium' : 'text-white/50'
                    }`}
                  >
                    {doc.title}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Active Doctor Full Detail Panel (8 cols) */}
          <div className="lg:col-span-8 p-8 md:p-12 bg-zinc-950 border border-blue-900/40 flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              {/* Doctor Head Info */}
              <div className="border-b border-white/10 pb-6">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-mono tracking-widest text-blue-400 uppercase font-bold">
                    SRI LANKA MEDICAL COUNCIL REGISTERED
                  </span>
                  <span className="px-3 py-1 bg-blue-600 text-white text-[11px] font-bold uppercase">
                    {activeDoctor.experience}
                  </span>
                </div>

                <h3 className="font-['Syne',sans-serif] text-3xl md:text-4xl font-extrabold uppercase text-white">
                  {activeDoctor.name}
                </h3>
                <p className="text-sm font-semibold text-blue-300 mt-1">
                  {activeDoctor.title}
                </p>
                <p className="text-xs text-white/50 font-mono mt-1">
                  {activeDoctor.qualification}
                </p>
              </div>

              {/* Bio */}
              <p className="text-sm md:text-base text-white/80 leading-relaxed font-normal">
                {activeDoctor.bio}
              </p>

              {/* Specialties */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 block">
                  AREAS OF EXPERTISE:
                </span>
                <div className="flex flex-wrap gap-2">
                  {activeDoctor.specialties.map((spec, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 bg-blue-950/40 border border-blue-800/30 text-xs font-semibold text-blue-300"
                    >
                      ✓ {spec}
                    </span>
                  ))}
                </div>
              </div>

              {/* Clinic Schedule & Locations in Sri Lanka */}
              <div className="p-4 bg-zinc-900/80 border border-white/10 space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 block">
                  CLINIC SCHEDULE & BRANCH LOCATIONS:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {activeDoctor.clinicDays.map((loc, idx) => (
                    <div key={idx} className="p-3 bg-zinc-950 border border-white/10 space-y-1">
                      <div className="flex items-center space-x-1.5 text-xs font-bold text-white">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span>{loc.location}</span>
                      </div>
                      <div className="text-[11px] text-white/70 pl-5">
                        {loc.days} • <span className="text-emerald-400 font-semibold">{loc.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Book Consult Action */}
            <div className="mt-8 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-white/50">
                Next available slot today at Colombo 07 & Kandy
              </div>
              <a
                href="#booking"
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-['Syne',sans-serif] text-xs font-bold uppercase tracking-widest text-center transition-colors shadow-lg cursor-pointer"
              >
                BOOK APPOINTMENT WITH {activeDoctor.name.split(' ')[1]}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
