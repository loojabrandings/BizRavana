'use client';

import React, { useEffect, useRef } from 'react';

export function VisionaraCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  // Exact same dimensions as Hero section rectangle (400 × 200)
  const LENS_WIDTH = 400;
  const LENS_HEIGHT = 200;

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    let targetX = -500;
    let targetY = -500;
    let currentX = -500;
    let currentY = -500;
    let rafId: number;
    let lastZoomedElement: HTMLElement | null = null;

    const render = () => {
      // Direct 60/120fps smooth lerp tracking
      currentX += (targetX - currentX) * 0.45;
      currentY += (targetY - currentY) * 0.45;

      cursor.style.transform = `translate3d(${currentX - LENS_WIDTH / 2}px, ${currentY - LENS_HEIGHT / 2}px, 0)`;

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    const onPointerMove = (e: PointerEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;

      // Check if we are currently inside the Hero Section
      const hero = document.getElementById('hero-section');
      let inHero = false;
      if (hero) {
        const heroRect = hero.getBoundingClientRect();
        inHero =
          e.clientY >= heroRect.top &&
          e.clientY <= heroRect.bottom &&
          e.clientX >= heroRect.left &&
          e.clientX <= heroRect.right;
      }

      if (inHero) {
        // In Hero section, hide this cursor so the Hero's own unblur lens handles it
        cursor.style.opacity = '0';
        cursor.style.display = 'none';
        if (lastZoomedElement) {
          lastZoomedElement.style.transform = '';
          lastZoomedElement = null;
        }
      } else {
        // In Other sections, show the 400x200 magnifying rectangle
        cursor.style.display = 'block';
        cursor.style.opacity = '1';

        // Find element under cursor and apply optical magnification zoom
        const elementsUnder = document.elementsFromPoint(e.clientX, e.clientY);
        const magnifiable = elementsUnder.find((el) => {
          if (el === cursor || el.contains(cursor) || cursor.contains(el)) return false;
          const tag = el.tagName.toLowerCase();
          return (
            tag === 'p' ||
            tag === 'h2' ||
            tag === 'h3' ||
            tag === 'h4' ||
            tag === 'span' ||
            tag === 'button' ||
            tag === 'a' ||
            (tag === 'div' && el.classList.contains('border'))
          );
        }) as HTMLElement | undefined;

        if (magnifiable && magnifiable !== hero && !hero?.contains(magnifiable)) {
          if (lastZoomedElement && lastZoomedElement !== magnifiable) {
            lastZoomedElement.style.transform = '';
            lastZoomedElement.style.transition = 'transform 0.2s ease-out';
          }
          magnifiable.style.transition = 'transform 0.15s ease-out';
          magnifiable.style.transformOrigin = 'center center';
          magnifiable.style.transform = 'scale(1.035)';
          lastZoomedElement = magnifiable;
        } else if (lastZoomedElement) {
          lastZoomedElement.style.transform = '';
          lastZoomedElement = null;
        }
      }
    };

    const onPointerLeave = () => {
      cursor.style.opacity = '0';
      if (lastZoomedElement) {
        lastZoomedElement.style.transform = '';
        lastZoomedElement = null;
      }
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('pointerleave', onPointerLeave);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerleave', onPointerLeave);
      if (lastZoomedElement) {
        lastZoomedElement.style.transform = '';
      }
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed top-0 left-0 z-[99999] opacity-0 will-change-transform box-border bg-white/[0.03] backdrop-contrast-125 backdrop-brightness-110"
      style={{
        width: `${LENS_WIDTH}px`,
        height: `${LENS_HEIGHT}px`,
        border: '2px solid rgba(255, 255, 255, 0.95)',
        boxShadow: '0 0 35px rgba(0, 0, 0, 0.8), 0 0 10px rgba(255, 255, 255, 0.15)',
      }}
    />
  );
}
