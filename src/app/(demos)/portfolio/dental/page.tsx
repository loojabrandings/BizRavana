'use client';

import React, { useState } from 'react';
import './dental.css';
import { DentalNavbar } from './components/DentalNavbar';
import { DentalMainFlow } from './components/DentalMainFlow';
import { DentalAppointmentModal } from './components/DentalAppointmentModal';

export default function DentalLandingPage() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-white text-slate-900 flex flex-col justify-start relative selection:bg-[#05c989] selection:text-white">
      {/* Top Floating Glass Header */}
      <DentalNavbar onOpenBooking={() => setIsBookingOpen(true)} />

      {/* Unified Page Flow with Continuous 3D Tooth Journey */}
      <main className="w-full flex-1">
        <DentalMainFlow onOpenBooking={() => setIsBookingOpen(true)} />
      </main>

      {/* Interactive Booking Modal */}
      <DentalAppointmentModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
}
