'use client';

import React from 'react';
import './salon.css';
import { SalonNav } from './components/SalonNav';
import { SalonHero } from './components/SalonHero';
import { SalonServices } from './components/SalonServices';
import { SalonSignature } from './components/SalonSignature';
import { SalonBeforeAfter } from './components/SalonBeforeAfter';
import { SalonWhyUs } from './components/SalonWhyUs';
import { SalonGallery } from './components/SalonGallery';
import { SalonReviews } from './components/SalonReviews';
import { SalonPackages } from './components/SalonPackages';
import { SalonBookingSection } from './components/SalonBookingSection';
import { SalonFooter } from './components/SalonFooter';

export default function SalonBossLandingPage() {
  return (
    <div className="min-h-screen bg-[#1C1C1C] text-[#F5F5F2] selection:bg-[#ECA53D] selection:text-[#1C1C1C] font-sans antialiased overflow-x-hidden">
      {/* Section 1: Sticky Navigation Bar */}
      <SalonNav />

      {/* Main Content Sections */}
      <main>
        {/* Section 2: Luxury Hero Experience */}
        <SalonHero />

        {/* Section 3: Everything You Need (5 Categories Services Menu) */}
        <SalonServices />

        {/* Section 4: Signature Services Highlight (Auto-Changing Slider) */}
        <SalonSignature />

        {/* Section 5: Before / After Transformations Slider */}
        <SalonBeforeAfter />

        {/* Section 6: Why Choose Salon Boss (Bespoke Editorial Pillars) */}
        <SalonWhyUs />

        {/* Section 7: Our Work & Bento Gallery */}
        <SalonGallery />

        {/* Section 8: Social Proof & Client Reviews (Single-Row Infinite Marquee) */}
        <SalonReviews />

        {/* Section 9: Special Packages & Limited-Time Promotional Offers */}
        <SalonPackages />

        {/* Section 10: 3-Branch Selector & 1-Click WhatsApp Booking Form */}
        <SalonBookingSection />
      </main>

      {/* Section 11: Luxury Footer */}
      <SalonFooter />
    </div>
  );
}
