'use client';

import React, { useState, useEffect } from 'react';
import Lenis from 'lenis';
import './kinetic.css';

import { KineticNavbar } from './components/KineticNavbar';
import { KineticHero } from './components/KineticHero';
import { KineticTicker } from './components/KineticTicker';
import { KineticStory } from './components/KineticStory';
import { KineticPrograms } from './components/KineticPrograms';
import { KineticTrainers } from './components/KineticTrainers';
import { KineticPricing } from './components/KineticPricing';
import { KineticCTABanner } from './components/KineticCTABanner';
import { KineticFooter } from './components/KineticFooter';
import { KineticEnrollModal } from './components/KineticEnrollModal';

export default function KineticGymPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('Performance Plan (Rs. 12,500/mo)');

  // Initialize Lenis Smooth Scroll
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    let animationFrameId: number;

    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }

    animationFrameId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, []);

  const handleOpenModal = (plan?: string) => {
    if (plan) {
      setSelectedPlan(plan);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="min-h-screen w-full bg-[#0D0D0D] text-white font-poppins relative selection:bg-[#E10600] selection:text-white overflow-x-hidden">
      {/* Fixed Sticky Glass Navbar */}
      <KineticNavbar onOpenModal={handleOpenModal} />

      {/* Main Landing Flow */}
      <main className="w-full flex flex-col">
        {/* 1. Hero Section with Strong Scroll Parallax & Massive "BUILD YOUR BODY" text */}
        <KineticHero onOpenModal={handleOpenModal} />

        {/* 2. Seamless Infinite Stats & Feature Ticker */}
        <KineticTicker />

        {/* 3. "WHERE STRENGTH IS FORGED" Dual-Column Parallax Gallery */}
        <KineticStory />

        {/* 4. "BODY TRANSFORMATION PROGRAMS" 4-Card Grid */}
        <KineticPrograms onOpenModal={handleOpenModal} />

        {/* 5. "EXPERT TRAINERS" Interactive 3-Column Switcher */}
        <KineticTrainers onOpenModal={handleOpenModal} />

        {/* 6. "CHOOSE YOUR POWER PLAN" Pricing with Monthly/Yearly Toggle */}
        <KineticPricing onOpenModal={handleOpenModal} />

        {/* 7. "TODAY NOW TOMORROW" High Impact CTA Banner */}
        <KineticCTABanner onOpenModal={handleOpenModal} />
      </main>

      {/* 8. Footer with Social Links & Watermark Typography */}
      <KineticFooter />

      {/* Interactive Join / Booking Modal */}
      <KineticEnrollModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialPlan={selectedPlan}
      />
    </div>
  );
}
