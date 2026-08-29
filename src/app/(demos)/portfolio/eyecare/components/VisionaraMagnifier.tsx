'use client';

import React, { useEffect, useRef } from 'react';
import { VisionaraBodyContent } from './VisionaraBodyContent';
import { useVisionaraStore } from './VisionaraStore';

export function VisionaraMagnifier() {
  const lensBoxRef = useRef<HTMLDivElement>(null);
  const innerWrapRef = useRef<HTMLDivElement>(null);
  const { effectiveTheme } = useVisionaraStore();

  // Exact 400x200 dimensions matching the hero section lens
  const RECT_WIDTH = 400;
  const RECT_HEIGHT = 200;
  const ZOOM_FACTOR = 1.22; // Physical magnification zoom

  useEffect(() => {
    const lensBox = lensBoxRef.current;
    const innerWrap = innerWrapRef.current;
    if (!lensBox || !innerWrap) return;

    let targetX = -500;
    let targetY = -500;
    let currentX = -500;
    let currentY = -500;
    let rafId: number;

    const updateInnerWidth = () => {
      if (innerWrap) {
        innerWrap.style.width = `${window.innerWidth}px`;
      }
    };

    updateInnerWidth();
    window.addEventListener('resize', updateInnerWidth);

    const render = () => {
      // 60/120fps hardware-accelerated fluid lerp
      currentX += (targetX - currentX) * 0.45;
      currentY += (targetY - currentY) * 0.45;

      if (window.innerWidth < 768) {
        lensBox.style.opacity = '0';
        rafId = requestAnimationFrame(render);
        return;
      }

      const hero = document.getElementById('hero-section');
      const bodySection = document.getElementById('visionara-body-content');
      const navbar = document.querySelector('header');

      const navHeight = navbar ? navbar.offsetHeight : 80;
      const inNavbar = targetY <= navHeight + 10 || currentY <= navHeight + 10;

      let inHero = true;
      if (hero) {
        const heroRect = hero.getBoundingClientRect();
        inHero =
          currentY >= heroRect.top &&
          currentY <= heroRect.bottom &&
          currentX >= heroRect.left &&
          currentX <= heroRect.right;
      }

      if (inHero || inNavbar || !bodySection) {
        // Hide global magnifier inside Hero section or when hovering over sticky Navbar
        lensBox.style.opacity = '0';
      } else {
        lensBox.style.opacity = '1';

        const halfW = RECT_WIDTH / 2;
        const halfH = RECT_HEIGHT / 2;
        const lensX = currentX - halfW;
        const lensY = currentY - halfH;

        // Position the 400x200 lens box
        lensBox.style.transform = `translate3d(${lensX}px, ${lensY}px, 0)`;

        // Calculate body section offset relative to viewport
        const bodyRect = bodySection.getBoundingClientRect();

        // Origin of zoom centered directly on the mouse pointer
        const originX = currentX;
        const originY = currentY - bodyRect.top;

        innerWrap.style.transformOrigin = `${originX}px ${originY}px`;
        innerWrap.style.transform = `translate3d(${-lensX}px, ${bodyRect.top - lensY}px, 0) scale(${ZOOM_FACTOR})`;
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    const onPointerMove = (e: PointerEvent) => {
      if (window.innerWidth < 768) return;
      targetX = e.clientX;
      targetY = e.clientY;
    };

    const onPointerLeave = () => {
      if (lensBox) lensBox.style.opacity = '0';
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', updateInnerWidth);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  return (
    <div
      ref={lensBoxRef}
      className="hidden md:block pointer-events-none fixed top-0 left-0 z-[9999] overflow-hidden opacity-0 will-change-transform box-border shadow-[0_0_50px_rgba(0,0,0,0.9)]"
      style={{
        width: `${RECT_WIDTH}px`,
        height: `${RECT_HEIGHT}px`,
        border:
          effectiveTheme === 'light'
            ? '2px solid rgba(15, 23, 42, 0.95)'
            : '2px solid rgba(255, 255, 255, 0.95)',
        background: effectiveTheme === 'light' ? '#ffffff' : '#000000',
      }}
    >
      {/* ── DUPLICATE BODY LAYER (Only visible & magnified strictly inside 400x200 frame) ── */}
      <div
        ref={innerWrapRef}
        data-theme={effectiveTheme}
        className="absolute top-0 left-0 will-change-transform select-none"
      >
        <div id="visionara-body-content" className="w-full bg-transparent">
          <VisionaraBodyContent />
        </div>
      </div>
    </div>
  );
}
