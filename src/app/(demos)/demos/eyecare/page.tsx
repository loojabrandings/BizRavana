'use client';

import React from 'react';
import './visionara.css';
import { VisionaraNavbar } from './components/VisionaraNavbar';
import { VisionaraHero } from './components/VisionaraHero';
import { VisionaraBodyContent } from './components/VisionaraBodyContent';
import { VisionaraMagnifier } from './components/VisionaraMagnifier';
import { useVisionaraStore } from './components/VisionaraStore';

export default function EyecareDemoPage() {
  const { effectiveTheme } = useVisionaraStore();

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Syne:wght@700;800;900&display=swap"
        rel="stylesheet"
      />

      <main
        data-theme={effectiveTheme}
        className="w-full min-h-screen visionara-page-canvas text-white overflow-x-hidden select-none relative"
      >
        {/* ── TOP STICKY NAVBAR (Glassmorphism + Single Icon Toggle) ── */}
        <VisionaraNavbar />

        {/* ── SECTION 1: HERO (Interactive Vision Lens + Editorial Typography) ── */}
        <VisionaraHero />

        {/* ── BASE INTERACTIVE BODY SECTIONS (Normal Scale 1.0) ── */}
        <div id="visionara-body-content" className="w-full">
          <VisionaraBodyContent />
        </div>

        {/* ── TRUE OPTICAL MAGNIFYING LENS (Only content inside 400x200 box is zoomed) ── */}
        <VisionaraMagnifier />
      </main>
    </>
  );
}
