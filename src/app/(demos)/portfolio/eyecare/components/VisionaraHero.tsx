'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';

export function VisionaraHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lensBoxRef = useRef<HTMLDivElement>(null);
  const lensInnerRef = useRef<HTMLDivElement>(null);

  // Rectangle lens dimensions (sharp rectangle, no rounded corners)
  const RECT_WIDTH = 400;
  const RECT_HEIGHT = 200;

  useEffect(() => {
    const container = containerRef.current;
    const lensBox = lensBoxRef.current;
    const lensInner = lensInnerRef.current;
    if (!container || !lensBox || !lensInner) return;

    let isInside = false;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let rafId: number;

    const updateInnerDimensions = () => {
      if (container && lensInner) {
        lensInner.style.width = `${container.offsetWidth}px`;
        lensInner.style.height = `${container.offsetHeight}px`;
      }
    };

    updateInnerDimensions();
    window.addEventListener('resize', updateInnerDimensions);

    const render = () => {
      if (isInside) {
        // Butter-smooth interpolation (lerp) for silky fluid motion
        currentX += (targetX - currentX) * 0.35;
        currentY += (targetY - currentY) * 0.35;

        const halfW = RECT_WIDTH / 2;
        const halfH = RECT_HEIGHT / 2;

        const lensX = currentX - halfW;
        const lensY = currentY - halfH;

        // Lens box moves to mouse position
        lensBox.style.transform = `translate3d(${lensX}px, ${lensY}px, 0)`;
        // Inner image counter-translates by exact opposite offset to stay 100% locked to background
        lensInner.style.transform = `translate3d(${-lensX}px, ${-lensY}px, 0)`;
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    const onPointerMove = (e: PointerEvent) => {
      if (window.innerWidth < 768) return;

      const rect = container.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;

      const navbar = document.querySelector('header');
      let inNavbar = false;
      if (navbar) {
        const navRect = navbar.getBoundingClientRect();
        inNavbar =
          e.clientY >= navRect.top &&
          e.clientY <= navRect.bottom &&
          e.clientX >= navRect.left &&
          e.clientX <= navRect.right;
      }

      if (inNavbar) {
        lensBox.style.opacity = '0';
        return;
      }

      if (!isInside) {
        isInside = true;
        currentX = targetX;
        currentY = targetY;
        lensBox.style.opacity = '1';
      } else {
        lensBox.style.opacity = '1';
      }
    };

    const onPointerEnter = (e: PointerEvent) => {
      if (window.innerWidth < 768) return;
      const rect = container.getBoundingClientRect();
      targetX = e.clientX - rect.left;
      targetY = e.clientY - rect.top;
      currentX = targetX;
      currentY = targetY;
      isInside = true;
      lensBox.style.opacity = '1';
    };

    const onPointerLeave = () => {
      isInside = false;
      lensBox.style.opacity = '0';
    };

    container.addEventListener('pointermove', onPointerMove, { passive: true });
    container.addEventListener('pointerenter', onPointerEnter, { passive: true });
    container.addEventListener('pointerleave', onPointerLeave, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateInnerDimensions);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerenter', onPointerEnter);
      container.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <section
      id="hero-section"
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-black select-none font-['Plus_Jakarta_Sans',sans-serif]"
    >
      {/* ── BASE LAYER: Clear on mobile, Blurred on desktop ── */}
      <div className="absolute inset-0 w-full h-full">
        <Image
          src="/demos/eyecare/hero.jpeg"
          alt="Visionara Eyecare"
          fill
          priority
          sizes="100vw"
          className="object-cover scale-105 md:filter md:blur-[14px]"
        />
        {/* Subtle Dark Vignette & Color Balance Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* ── RECTANGULAR FOCUS LENS (DESKTOP ONLY) ── */}
      <div
        ref={lensBoxRef}
        className="hidden md:block pointer-events-none absolute top-0 left-0 overflow-hidden opacity-0 will-change-transform transition-opacity duration-150 box-border z-10"
        style={{
          width: `${RECT_WIDTH}px`,
          height: `${RECT_HEIGHT}px`,
          border: '2px solid rgba(255, 255, 255, 0.95)',
          boxShadow: '0 0 35px rgba(0, 0, 0, 0.8), 0 0 10px rgba(255, 255, 255, 0.15)',
        }}
      >
        {/* Inner container matching the full section size, counter-translated to lock coordinates */}
        <div
          ref={lensInnerRef}
          className="absolute top-0 left-0 will-change-transform"
        >
          <Image
            src="/demos/eyecare/hero.jpeg"
            alt="Visionara Eyecare Clear"
            fill
            priority
            sizes="100vw"
            className="object-cover scale-105"
          />
        </div>
      </div>

      {/* ── BOTTOM CONTENT SECTION (Grid Layout Matching Reference) ── */}
      <div className="absolute bottom-0 left-0 w-full z-20 px-8 md:px-14 pb-12 md:pb-16 flex flex-col md:flex-row items-end justify-between gap-8 pointer-events-none">
        {/* Bottom-Left: Description & Book Call Button */}
        <div className="max-w-xs md:max-w-sm flex flex-col items-start space-y-6">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[11px] font-bold tracking-[0.2em] text-blue-400 uppercase font-mono">
              COLOMBO • KANDY • GALLE
            </span>
          </div>

          <p className="text-[12px] md:text-[13px] font-semibold text-white/90 tracking-[0.12em] uppercase leading-relaxed font-sans">
            CLEAR VISION AND MODERN EYEWEAR DESIGNED FOR YOUR EVERYDAY COMFORT.
          </p>

          <button className="pointer-events-auto px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-['Syne',sans-serif] text-[12px] font-bold tracking-[0.15em] uppercase transition-all duration-200 shadow-lg cursor-pointer">
            BOOK AN APPOINTMENT
          </button>
        </div>

        {/* Bottom-Right: Massive Editorial Headline */}
        <div className="text-right flex flex-col items-end">
          <h2 className="font-['Syne',sans-serif] text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold uppercase tracking-tight text-white leading-[0.92] drop-shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
            YOUR VISION’S
            <br />
            <span className="text-blue-400">NEXT CHAPTER,</span>
            <br />
            PERFECTED.
          </h2>
        </div>
      </div>
    </section>
  );
}
