'use client';

import React from 'react';
import { VisionaraAbout } from './VisionaraAbout';
import { VisionaraServices } from './VisionaraServices';
import { VisionaraEyewear } from './VisionaraEyewear';
import { VisionaraProcess } from './VisionaraProcess';
import { VisionaraDoctors } from './VisionaraDoctors';
import { VisionaraReviews } from './VisionaraReviews';
import { VisionaraBooking } from './VisionaraBooking';
import { VisionaraFAQ } from './VisionaraFAQ';
import { VisionaraFooter } from './VisionaraFooter';

export function VisionaraBodyContent() {
  return (
    <div className="w-full bg-transparent text-white">
      {/* ── SECTION 2: ABOUT & PILLARS ── */}
      <VisionaraAbout />

      {/* ── SECTION 3: SERVICES & DIAGNOSTIC CONSOLE (LKR Pricing) ── */}
      <VisionaraServices />

      {/* ── SECTION 4: CURATED EYEWEAR & FRAME EXPLORER ── */}
      <VisionaraEyewear />

      {/* ── SECTION 5: HOW YOUR VISIT WORKS (4-Step Timeline) ── */}
      <VisionaraProcess />

      {/* ── SECTION 6: SRI LANKAN EYE DOCTORS & SPECIALISTS ── */}
      <VisionaraDoctors />

      {/* ── SECTION 7: VERIFIED PATIENT STORIES & GOOGLE REVIEWS ── */}
      <VisionaraReviews />

      {/* ── SECTION 8: INTERACTIVE APPOINTMENT & VISIT PLANNER ── */}
      <VisionaraBooking />

      {/* ── SECTION 9: SRI LANKAN INSURANCE & COMMON FAQS ── */}
      <VisionaraFAQ />

      {/* ── SECTION 10: LUXURY CLINIC FOOTER & LOCATIONS ── */}
      <VisionaraFooter />
    </div>
  );
}
