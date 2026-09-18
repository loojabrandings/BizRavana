'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Lenis from 'lenis';
import { motion, useScroll, useTransform } from 'framer-motion';
import './gem.css';

export default function GemPortfolioPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  const aboutRef = useRef<HTMLElement | null>(null);
  const servicesRef = useRef<HTMLElement | null>(null);
  const logisticsRef = useRef<HTMLElement | null>(null);

  const [activeSection, setActiveSection] = useState<number>(1);
  const [scrollProgress, setScrollProgress] = useState<number>(0);

  // Smooth video scrubbing refs
  const targetTimeRef = useRef<number>(0);
  const currentTimeRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);

  // ── Framer Motion Section Scroll Tracking ──────────────────────────
  // Hero Scroll Motion
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  const heroNavY = useTransform(heroScroll, [0, 0.5], [0, -110]);
  const heroNavOpacity = useTransform(heroScroll, [0, 0.4], [1, 0]);

  const heroBadgeX = useTransform(heroScroll, [0, 0.55], [0, -320]);
  const heroBadgeRotate = useTransform(heroScroll, [0, 0.55], [0, -10]);
  const heroBadgeOpacity = useTransform(heroScroll, [0, 0.45], [1, 0]);

  const heroHeadlineX = useTransform(heroScroll, [0, 0.65], [0, -420]);
  const heroHeadlineY = useTransform(heroScroll, [0, 0.65], [0, -180]);
  const heroHeadlineRotate = useTransform(heroScroll, [0, 0.65], [0, -8]);
  const heroHeadlineOpacity = useTransform(heroScroll, [0, 0.55], [1, 0]);

  const heroBioX = useTransform(heroScroll, [0, 0.65], [0, 400]);
  const heroBioY = useTransform(heroScroll, [0, 0.65], [0, 130]);
  const heroBioRotate = useTransform(heroScroll, [0, 0.65], [0, 7]);
  const heroBioOpacity = useTransform(heroScroll, [0, 0.55], [1, 0]);

  const heroCtaX = useTransform(heroScroll, [0, 0.6], [0, 320]);
  const heroCtaScale = useTransform(heroScroll, [0, 0.6], [1, 0.65]);
  const heroCtaOpacity = useTransform(heroScroll, [0, 0.5], [1, 0]);

  const heroTitleScale = useTransform(heroScroll, [0, 0.7], [1, 1.48]);
  const heroTitleY = useTransform(heroScroll, [0, 0.7], [0, -200]);
  const heroTitleOpacity = useTransform(heroScroll, [0, 0.6], [1, 0]);

  // About Us Scroll Motion (Entrance -> Center -> Departure)
  const { scrollYProgress: aboutScroll } = useScroll({
    target: aboutRef,
    offset: ['start end', 'end start'],
  });

  const aboutBadgeY = useTransform(aboutScroll, [0.08, 0.38, 0.62, 0.88], [-120, 0, 0, -100]);
  const aboutBadgeOpacity = useTransform(aboutScroll, [0.12, 0.36, 0.64, 0.85], [0, 1, 1, 0]);

  const aboutTitleX = useTransform(aboutScroll, [0.08, 0.4, 0.6, 0.9], [420, 0, 0, -440]);
  const aboutTitleRotate = useTransform(aboutScroll, [0.08, 0.4, 0.6, 0.9], [8, 0, 0, -8]);
  const aboutTitleScale = useTransform(aboutScroll, [0.08, 0.4, 0.6, 0.9], [1.35, 1, 1, 0.8]);
  const aboutTitleOpacity = useTransform(aboutScroll, [0.12, 0.38, 0.62, 0.86], [0, 1, 1, 0]);

  const aboutIntroX = useTransform(aboutScroll, [0.12, 0.42, 0.58, 0.88], [-360, 0, 0, 360]);
  const aboutIntroY = useTransform(aboutScroll, [0.12, 0.42, 0.58, 0.88], [130, 0, 0, -140]);
  const aboutIntroRotate = useTransform(aboutScroll, [0.12, 0.42, 0.58, 0.88], [-5, 0, 0, 6]);
  const aboutIntroOpacity = useTransform(aboutScroll, [0.15, 0.4, 0.6, 0.85], [0, 1, 1, 0]);

  const aboutStatsY = useTransform(aboutScroll, [0.16, 0.44, 0.58, 0.88], [160, 0, 0, 160]);
  const aboutStatsScale = useTransform(aboutScroll, [0.16, 0.44, 0.58, 0.88], [0.82, 1, 1, 0.82]);
  const aboutStatsOpacity = useTransform(aboutScroll, [0.2, 0.42, 0.6, 0.84], [0, 1, 1, 0]);

  // Services Scroll Motion (Entrance -> Center)
  const { scrollYProgress: servicesScroll } = useScroll({
    target: servicesRef,
    offset: ['start end', 'end start'],
  });

  const servicesBadgeY = useTransform(servicesScroll, [0.05, 0.3], [-90, 0]);
  const servicesBadgeOpacity = useTransform(servicesScroll, [0.08, 0.26], [0, 1]);

  const servicesTitleY = useTransform(servicesScroll, [0.05, 0.3], [-160, 0]);
  const servicesTitleScale = useTransform(servicesScroll, [0.05, 0.3], [1.35, 1]);
  const servicesTitleOpacity = useTransform(servicesScroll, [0.08, 0.26], [0, 1]);

  // Left Column (3 Services - 3 Distinct Entry Angles, resting cleanly by 0.38)
  const s1X = useTransform(servicesScroll, [0.08, 0.34], [-360, 0]);
  const s1Y = useTransform(servicesScroll, [0.08, 0.34], [-80, 0]);
  const s1Rotate = useTransform(servicesScroll, [0.08, 0.34], [-8, 0]);
  const s1Opacity = useTransform(servicesScroll, [0.1, 0.28], [0, 1]);

  const s2X = useTransform(servicesScroll, [0.12, 0.36], [-400, 0]);
  const s2Rotate = useTransform(servicesScroll, [0.12, 0.36], [-4, 0]);
  const s2Opacity = useTransform(servicesScroll, [0.14, 0.3], [0, 1]);

  const s3X = useTransform(servicesScroll, [0.16, 0.38], [-360, 0]);
  const s3Y = useTransform(servicesScroll, [0.16, 0.38], [80, 0]);
  const s3Rotate = useTransform(servicesScroll, [0.16, 0.38], [6, 0]);
  const s3Opacity = useTransform(servicesScroll, [0.18, 0.32], [0, 1]);

  // Right Column (3 Services - 3 Distinct Entry Angles, resting cleanly by 0.38)
  const s4X = useTransform(servicesScroll, [0.08, 0.34], [360, 0]);
  const s4Y = useTransform(servicesScroll, [0.08, 0.34], [-80, 0]);
  const s4Rotate = useTransform(servicesScroll, [0.08, 0.34], [8, 0]);
  const s4Opacity = useTransform(servicesScroll, [0.1, 0.28], [0, 1]);

  const s5X = useTransform(servicesScroll, [0.12, 0.36], [400, 0]);
  const s5Rotate = useTransform(servicesScroll, [0.12, 0.36], [4, 0]);
  const s5Opacity = useTransform(servicesScroll, [0.14, 0.3], [0, 1]);

  const s6X = useTransform(servicesScroll, [0.16, 0.38], [360, 0]);
  const s6Y = useTransform(servicesScroll, [0.16, 0.38], [80, 0]);
  const s6Rotate = useTransform(servicesScroll, [0.16, 0.38], [-6, 0]);
  const s6Opacity = useTransform(servicesScroll, [0.18, 0.32], [0, 1]);

  // ── Logistics & Policies Scroll Motion (Section 04) ────────────────
  const { scrollYProgress: logisticsScroll } = useScroll({
    target: logisticsRef,
    offset: ['start end', 'end start'],
  });

  const logisticsBadgeY = useTransform(logisticsScroll, [0.05, 0.28], [-60, 0]);
  const logisticsBadgeOpacity = useTransform(logisticsScroll, [0.08, 0.25], [0, 1]);

  const logisticsTitleY = useTransform(logisticsScroll, [0.05, 0.3], [-120, 0]);
  const logisticsTitleScale = useTransform(logisticsScroll, [0.05, 0.3], [1.25, 1]);
  const logisticsTitleOpacity = useTransform(logisticsScroll, [0.08, 0.26], [0, 1]);

  const logisticsLeadY = useTransform(logisticsScroll, [0.08, 0.32], [40, 0]);
  const logisticsLeadOpacity = useTransform(logisticsScroll, [0.1, 0.28], [0, 1]);

  const policyCard1Y = useTransform(logisticsScroll, [0.12, 0.34], [60, 0]);
  const policyCard1Opacity = useTransform(logisticsScroll, [0.12, 0.32], [0, 1]);

  const policyCard2Y = useTransform(logisticsScroll, [0.15, 0.37], [75, 0]);
  const policyCard2Opacity = useTransform(logisticsScroll, [0.15, 0.35], [0, 1]);

  const policyCard3Y = useTransform(logisticsScroll, [0.18, 0.4], [90, 0]);
  const policyCard3Opacity = useTransform(logisticsScroll, [0.18, 0.38], [0, 1]);

  const logisticsStatsY = useTransform(logisticsScroll, [0.22, 0.44], [50, 0]);
  const logisticsStatsOpacity = useTransform(logisticsScroll, [0.22, 0.42], [0, 1]);

  // ── Lenis & Video Scrubbing ─────────────────────────────────────────
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.9,
    });

    let isRunning = true;

    function raf(time: number) {
      lenis.raf(time);
      if (isRunning) {
        requestAnimationFrame(raf);
      }
    }
    requestAnimationFrame(raf);

    const updateVideoFrame = () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2 && video.duration) {
        const diff = targetTimeRef.current - currentTimeRef.current;
        
        if (Math.abs(diff) > 0.001) {
          currentTimeRef.current += diff * 0.15;
          currentTimeRef.current = Math.max(0, Math.min(currentTimeRef.current, video.duration - 0.01));
          video.currentTime = currentTimeRef.current;
        }
      }
      rafIdRef.current = requestAnimationFrame(updateVideoFrame);
    };
    rafIdRef.current = requestAnimationFrame(updateVideoFrame);

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll <= 0) return;

      const currentScroll = window.scrollY;
      const progress = Math.min(Math.max(currentScroll / totalScroll, 0), 1);
      setScrollProgress(progress);

      const video = videoRef.current;
      if (video && video.duration) {
        // Sections 1 to 3 scrub the gem video across its timeline; held smoothly during Section 4
        const videoProgress = Math.min(progress / 0.75, 1);
        targetTimeRef.current = videoProgress * video.duration;
      }

      if (progress < 0.25) {
        setActiveSection(1);
      } else if (progress < 0.5) {
        setActiveSection(2);
      } else if (progress < 0.75) {
        setActiveSection(3);
      } else {
        setActiveSection(4);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      isRunning = false;
      lenis.destroy();
      window.removeEventListener('scroll', handleScroll);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  const onLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
      targetTimeRef.current = 0;
      currentTimeRef.current = 0;
    }
  }, []);

  const scrollToSection = (sectionIndex: number) => {
    const targetEl = document.getElementById(`gem-sec-${sectionIndex}`);
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div ref={containerRef} className="gem-page-root">
      {/* ── Pinned Fullscreen Video Backdrop ── */}
      <div className="gem-video-backdrop" aria-hidden="true">
        <video
          ref={videoRef}
          className="gem-video-element"
          src="/demos/gem/scroll%20video.mp4"
          playsInline
          muted
          autoPlay={false}
          preload="auto"
          onLoadedMetadata={onLoadedMetadata}
        />
      </div>

      {/* ── Floating Minimalist Side Nav (Pips only) ── */}
      <nav className="gem-side-nav" aria-label="Section Navigation">
        {[1, 2, 3, 4].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => scrollToSection(num)}
            className={`gem-nav-item ${activeSection === num ? 'active' : ''}`}
            aria-label={`Navigate to Section ${num}`}
          >
            <div className="gem-nav-pip" />
          </button>
        ))}
      </nav>

      {/* ── Bottom Scroll Progress Bar ── */}
      <div className="gem-progress-track">
        <div
          className="gem-progress-fill"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      {/* ── Main Scroll Sections Track ── */}
      <div className="gem-sections-container">
        {/* ── SECTION 01: HERO (With Directional Scroll Departures) ── */}
        <section
          ref={heroRef}
          id="gem-sec-1"
          className="gem-hero-section"
        >
          {/* Top Navbar Pill */}
          <motion.div
            className="gem-top-nav-bar"
            style={{ y: heroNavY, opacity: heroNavOpacity }}
          >
            <div className="gem-brand-pill">
              <div className="gem-brand-logo-icon">
                <div className="gem-brand-logo-inner" />
              </div>
              <span className="gem-brand-name">Ceylon Gems</span>
              <button
                type="button"
                className="gem-menu-toggle-btn"
                aria-label="Toggle navigation menu"
              >
                <span className="gem-menu-line" />
                <span className="gem-menu-line" />
              </button>
            </div>
          </motion.div>

          {/* Middle Content Grid (Left & Right Opposing Paths) */}
          <div className="gem-hero-mid-grid">
            {/* Left Column */}
            <div className="gem-hero-left-col">
              <motion.div
                className="gem-status-badge"
                style={{
                  x: heroBadgeX,
                  rotate: heroBadgeRotate,
                  opacity: heroBadgeOpacity,
                }}
              >
                <span className="gem-status-dot" />
                <span>Ethically Mined in Sri Lanka</span>
              </motion.div>
              <motion.h1
                className="gem-hero-headline"
                style={{
                  x: heroHeadlineX,
                  y: heroHeadlineY,
                  rotate: heroHeadlineRotate,
                  opacity: heroHeadlineOpacity,
                }}
              >
                Rare Ceylon Sapphires & Precious Gemstones based in Sri Lanka
              </motion.h1>
            </div>

            {/* Right Column */}
            <div className="gem-hero-right-col">
              <motion.p
                className="gem-hero-bio"
                style={{
                  x: heroBioX,
                  y: heroBioY,
                  rotate: heroBioRotate,
                  opacity: heroBioOpacity,
                }}
              >
                Unearthing Sri Lanka’s rarest untreated royal blue sapphires, padparadscha, and collector-grade precious gemstones directly from the historic gem pits of Ratnapura.
              </motion.p>
              <motion.a
                href="#gem-sec-2"
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection(2);
                }}
                className="gem-cta-button"
                style={{
                  x: heroCtaX,
                  scale: heroCtaScale,
                  opacity: heroCtaOpacity,
                }}
              >
                <div className="gem-cta-icon-circle">
                  <svg
                    className="gem-cta-arrow"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      d="M5 12h14M12 5l7 7-7 7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <span>Explore Collection</span>
              </motion.a>
            </div>
          </div>

          {/* Bottom Monumental Word (3D Zoom & Upward Arc) */}
          <div className="gem-hero-bottom-container">
            <motion.h2
              className="gem-hero-monumental-title"
              style={{
                scale: heroTitleScale,
                y: heroTitleY,
                opacity: heroTitleOpacity,
              }}
            >
              CEYLON GEMS
            </motion.h2>
          </div>
        </section>

        {/* ── SECTION 02: ABOUT US (Dynamic Converging & Departing Vectors) ── */}
        <section
          ref={aboutRef}
          id="gem-sec-2"
          className="gem-about-section"
        >
          <div className="gem-about-container">
            {/* About Header */}
            <div className="gem-about-header">
              <motion.div
                className="gem-status-badge"
                style={{ y: aboutBadgeY, opacity: aboutBadgeOpacity }}
              >
                <span className="gem-status-dot" />
                <span>Our Heritage</span>
              </motion.div>
              <motion.h2
                className="gem-about-title"
                style={{
                  x: aboutTitleX,
                  rotate: aboutTitleRotate,
                  scale: aboutTitleScale,
                  opacity: aboutTitleOpacity,
                }}
              >
                ABOUT US
              </motion.h2>
              <motion.p
                className="gem-about-intro"
                style={{
                  x: aboutIntroX,
                  y: aboutIntroY,
                  rotate: aboutIntroRotate,
                  opacity: aboutIntroOpacity,
                }}
              >
                Known to antiquity as <em>Ratna-Dweepa</em>, Sri Lanka has endowed royal treasuries with legendary gemstones for over two thousand years. Operating from the alluvial heart of Ratnapura, we uphold direct pit-to-collector custody — unearthing natural Ceylon sapphires of unmatched optical purity and ethical integrity.
              </motion.p>
            </div>

            {/* Metrics / Provenance Row */}
            <motion.div
              className="gem-about-stats-bar"
              style={{
                y: aboutStatsY,
                scale: aboutStatsScale,
                opacity: aboutStatsOpacity,
              }}
            >
              <div className="gem-stat-item">
                <span className="gem-stat-val">2,000+</span>
                <span className="gem-stat-label">Years Ceylon Heritage</span>
              </div>
              <div className="gem-stat-item">
                <span className="gem-stat-val">0%</span>
                <span className="gem-stat-label">Heat or Chemical Treatment</span>
              </div>
              <div className="gem-stat-item">
                <span className="gem-stat-val">100%</span>
                <span className="gem-stat-label">Mine-to-Vault Traceability</span>
              </div>
              <div className="gem-stat-item">
                <span className="gem-stat-val">GIA / SSEF</span>
                <span className="gem-stat-label">Independent Certification</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── SECTION 03: SERVICES (Directional Split Convergence from Left & Right) ── */}
        <section
          ref={servicesRef}
          id="gem-sec-3"
          className="gem-services-section"
        >
          <div className="gem-services-container">
            {/* Top Center Title Header */}
            <div className="gem-services-header">
              <motion.div
                className="gem-status-badge"
                style={{ y: servicesBadgeY, opacity: servicesBadgeOpacity }}
              >
                <span className="gem-status-dot" />
                <span>Services</span>
              </motion.div>
              <motion.h2
                className="gem-services-title"
                style={{
                  y: servicesTitleY,
                  scale: servicesTitleScale,
                  opacity: servicesTitleOpacity,
                }}
              >
                WE OFFER
              </motion.h2>
            </div>

            {/* Split Grid: 3 Left Paths & 3 Right Paths */}
            <div className="gem-services-split-grid">
              {/* Left Column (3 Services from Left Diagonals) */}
              <div className="gem-services-col">
                {/* Service 1 */}
                <motion.div
                  className="gem-service-card"
                  style={{
                    x: s1X,
                    y: s1Y,
                    rotate: s1Rotate,
                    opacity: s1Opacity,
                  }}
                >
                  <div className="gem-service-card-header">
                    <div className="gem-service-icon-wrap">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 3h12l4 6-10 12L2 9z" />
                        <path d="M10 9l2 12 2-12" />
                      </svg>
                    </div>
                    <h3 className="gem-service-card-title">Precision Lapidary & Custom Faceting</h3>
                  </div>
                  <p className="gem-service-card-desc">
                    Expert multi-generational cutting, recutting, and bespoke faceting to maximize optical fire, brilliance, and color depth.
                  </p>
                </motion.div>

                {/* Service 2 */}
                <motion.div
                  className="gem-service-card"
                  style={{
                    x: s2X,
                    rotate: s2Rotate,
                    opacity: s2Opacity,
                  }}
                >
                  <div className="gem-service-card-header">
                    <div className="gem-service-icon-wrap">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
                      </svg>
                    </div>
                    <h3 className="gem-service-card-title">B2B Wholesale & Calibrated Parcel Sourcing</h3>
                  </div>
                  <p className="gem-service-card-desc">
                    Direct-from-source bulk lots and precision-calibrated gemstone parcels tailored for global jewelers and luxury brands.
                  </p>
                </motion.div>

                {/* Service 3 */}
                <motion.div
                  className="gem-service-card"
                  style={{
                    x: s3X,
                    y: s3Y,
                    rotate: s3Rotate,
                    opacity: s3Opacity,
                  }}
                >
                  <div className="gem-service-card-header">
                    <div className="gem-service-icon-wrap">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <path d="M9 12l2 2 4-4" />
                      </svg>
                    </div>
                    <h3 className="gem-service-card-title">Independent Lab Testing & Certification</h3>
                  </div>
                  <p className="gem-service-card-desc">
                    Scientifically tested and certified unheated with dual-provenance reports from premier global laboratories.
                  </p>
                </motion.div>
              </div>

              {/* Right Column (3 Services from Right Diagonals) */}
              <div className="gem-services-col">
                {/* Service 4 */}
                <motion.div
                  className="gem-service-card"
                  style={{
                    x: s4X,
                    y: s4Y,
                    rotate: s4Rotate,
                    opacity: s4Opacity,
                  }}
                >
                  <div className="gem-service-card-header">
                    <div className="gem-service-icon-wrap">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    </div>
                    <h3 className="gem-service-card-title">Private Gem Brokerage & Rare Stone Sourcing</h3>
                  </div>
                  <p className="gem-service-card-desc">
                    Confidential acquisition of museum-grade Ceylon sapphires, padparadschas, and collector stones for private clients.
                  </p>
                </motion.div>

                {/* Service 5 */}
                <motion.div
                  className="gem-service-card"
                  style={{
                    x: s5X,
                    rotate: s5Rotate,
                    opacity: s5Opacity,
                  }}
                >
                  <div className="gem-service-card-header">
                    <div className="gem-service-icon-wrap">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    </div>
                    <h3 className="gem-service-card-title">Fully Insured Worldwide Courier & Export Logistics</h3>
                  </div>
                  <p className="gem-service-card-desc">
                    Secure worldwide door-to-door transit via armored couriers with comprehensive full-value insurance coverage.
                  </p>
                </motion.div>

                {/* Service 6 */}
                <motion.div
                  className="gem-service-card"
                  style={{
                    x: s6X,
                    y: s6Y,
                    rotate: s6Rotate,
                    opacity: s6Opacity,
                  }}
                >
                  <div className="gem-service-card-header">
                    <div className="gem-service-icon-wrap">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="7" />
                        <polyline points="12 9 12 12 13.5 13.5" />
                        <path d="M16.51 17.35l-.35 3.83a2 2 0 0 1-2 1.82H9.83a2 2 0 0 1-2-1.82l-.35-3.83m.01-10.7l.35-3.83A2 2 0 0 1 9.83 1h4.35a2 2 0 0 1 2 1.82l.35 3.83" />
                      </svg>
                    </div>
                    <h3 className="gem-service-card-title">Custom Bespoke Jewelry Design & Setting</h3>
                  </div>
                  <p className="gem-service-card-desc">
                    One-of-a-kind fine jewelry commissions handcrafted in 18K solid gold and 950 platinum around your chosen sapphire.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 04: LOGISTICS, INSURANCE & POLICIES (No Video) ── */}
        <section
          ref={logisticsRef}
          id="gem-sec-4"
          className="gem-logistics-section"
        >
          <div className="gem-logistics-container">
            {/* Header */}
            <div className="gem-logistics-header">
              <motion.div
                className="gem-status-badge"
                style={{ y: logisticsBadgeY, opacity: logisticsBadgeOpacity }}
              >
                <span className="gem-status-dot" />
                <span>Security & Trust</span>
              </motion.div>
              <motion.h2
                className="gem-logistics-title"
                style={{
                  y: logisticsTitleY,
                  scale: logisticsTitleScale,
                  opacity: logisticsTitleOpacity,
                }}
              >
                SHIPPING & POLICIES
              </motion.h2>
              <motion.p
                className="gem-logistics-lead"
                style={{ y: logisticsLeadY, opacity: logisticsLeadOpacity }}
              >
                Direct-from-source Ceylon precious gemstones delivered with sovereign export credentials, institutional armored logistics, 100% full-value replacement insurance, and an unconditional 14-day gemological inspection guarantee.
              </motion.p>
            </div>

            {/* 3 Pillars Grid */}
            <div className="gem-logistics-grid">
              {/* Pillar 01: Worldwide Shipping Methods */}
              <motion.div
                className="gem-policy-card"
                style={{ y: policyCard1Y, opacity: policyCard1Opacity }}
              >
                <div className="gem-policy-card-accent-line" />
                <div className="gem-policy-header">
                  <div className="gem-policy-icon-row">
                    <div className="gem-policy-icon-wrap">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                      </svg>
                    </div>
                    <span className="gem-policy-pill">Courier Logistics</span>
                  </div>
                  <h3 className="gem-policy-title">Worldwide Armored Shipping</h3>
                </div>

                <ul className="gem-policy-list">
                  <li className="gem-policy-item">
                    <svg className="gem-policy-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span><strong>Premier Carriers:</strong> Global high-security transit via <em>Malca-Amit</em>, <em>Ferrari Express</em>, and <em>FedEx International Priority</em>.</span>
                  </li>
                  <li className="gem-policy-item">
                    <svg className="gem-policy-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span><strong>State Export Permitted:</strong> Every shipment carries verified Sri Lanka National Gem & Jewellery Authority (NGJA) customs clearance.</span>
                  </li>
                  <li className="gem-policy-item">
                    <svg className="gem-policy-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span><strong>Discrete Packaging:</strong> Double-sealed, tamper-evident security containers with discreet outward labeling and private tracking.</span>
                  </li>
                </ul>

                <div className="gem-carriers-row">
                  <div className="gem-carrier-tag">
                    <span className="gem-carrier-tag-dot" />
                    <span>FedEx Priority</span>
                  </div>
                  <div className="gem-carrier-tag">
                    <span className="gem-carrier-tag-dot" />
                    <span>Malca-Amit</span>
                  </div>
                  <div className="gem-carrier-tag">
                    <span className="gem-carrier-tag-dot" />
                    <span>Ferrari Express</span>
                  </div>
                </div>
              </motion.div>

              {/* Pillar 02: 100% Insured Transit Policy */}
              <motion.div
                className="gem-policy-card"
                style={{ y: policyCard2Y, opacity: policyCard2Opacity }}
              >
                <div className="gem-policy-card-accent-line" />
                <div className="gem-policy-header">
                  <div className="gem-policy-icon-row">
                    <div className="gem-policy-icon-wrap">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        <polyline points="9 12 12 15 16 10" />
                      </svg>
                    </div>
                    <span className="gem-policy-pill">100% Coverage</span>
                  </div>
                  <h3 className="gem-policy-title">Full Declared Value Insurance</h3>
                </div>

                <ul className="gem-policy-list">
                  <li className="gem-policy-item">
                    <svg className="gem-policy-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span><strong>Institutional Underwriting:</strong> 100% full declared value coverage backed by Lloyd's of London from dispatch to physical receipt.</span>
                  </li>
                  <li className="gem-policy-item">
                    <svg className="gem-policy-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span><strong>Zero Buyer Liability:</strong> In the rare event of transit damage, loss, or customs holdup, receive an immediate 100% reimbursement or replacement.</span>
                  </li>
                  <li className="gem-policy-item">
                    <svg className="gem-policy-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span><strong>Bonded Direct Handover:</strong> Deliveries require government photo ID verification and direct physical signature upon arrival.</span>
                  </li>
                </ul>

                <div className="gem-carriers-row">
                  <div className="gem-carrier-tag">
                    <span className="gem-carrier-tag-dot" />
                    <span>Lloyd's Underwritten</span>
                  </div>
                  <div className="gem-carrier-tag">
                    <span className="gem-carrier-tag-dot" />
                    <span>Zero Buyer Risk</span>
                  </div>
                </div>
              </motion.div>

              {/* Pillar 03: 14-Day Return & Money-Back Guarantee */}
              <motion.div
                className="gem-policy-card"
                style={{ y: policyCard3Y, opacity: policyCard3Opacity }}
              >
                <div className="gem-policy-card-accent-line" />
                <div className="gem-policy-header">
                  <div className="gem-policy-icon-row">
                    <div className="gem-policy-icon-wrap">
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                      </svg>
                    </div>
                    <span className="gem-policy-pill">Money-Back Guarantee</span>
                  </div>
                  <h3 className="gem-policy-title">14-Day Inspection & Full Refund</h3>
                </div>

                <ul className="gem-policy-list">
                  <li className="gem-policy-item">
                    <svg className="gem-policy-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span><strong>14-Day Lab Inspection Window:</strong> Take your gem to any premier laboratory (GIA, Gübelin, SSEF) for independent appraisal and grading.</span>
                  </li>
                  <li className="gem-policy-item">
                    <svg className="gem-policy-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span><strong>100% Full Money-Back:</strong> If the gemstone deviates in treatment or origin from our disclosures, receive an immediate 100% full refund.</span>
                  </li>
                  <li className="gem-policy-item">
                    <svg className="gem-policy-check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span><strong>Complimentary Insured Returns:</strong> We coordinate and prepay fully insured armored pickup directly from your premises.</span>
                  </li>
                </ul>

                <div className="gem-carriers-row">
                  <div className="gem-carrier-tag">
                    <span className="gem-carrier-tag-dot" />
                    <span>14-Day Window</span>
                  </div>
                  <div className="gem-carrier-tag">
                    <span className="gem-carrier-tag-dot" />
                    <span>Free Insured Returns</span>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Trust Metrics Bar */}
            <motion.div
              className="gem-logistics-stats-bar"
              style={{ y: logisticsStatsY, opacity: logisticsStatsOpacity }}
            >
              <div className="gem-stat-item">
                <span className="gem-stat-val">35+</span>
                <span className="gem-stat-label">Countries Delivered</span>
              </div>
              <div className="gem-stat-item">
                <span className="gem-stat-val">100%</span>
                <span className="gem-stat-label">Insured Transit Value</span>
              </div>
              <div className="gem-stat-item">
                <span className="gem-stat-val">0%</span>
                <span className="gem-stat-label">Client Transit Risk</span>
              </div>
              <div className="gem-stat-item">
                <span className="gem-stat-val">14 Days</span>
                <span className="gem-stat-label">Unconditional Review</span>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </div>
  );
}
