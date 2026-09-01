'use client';

import React from 'react';

const ECG_PATH =
  'M0 70 H150 L175 70 190 42 205 98 220 55 235 70 H460 L482 70 500 16 520 124 540 30 556 70 H800 L820 70 836 44 852 98 868 55 884 70 H1052 L1070 70 1086 34 1104 106 1120 50 1134 70 H1200';

interface LifeCareEcgLineProps {
  variant?: 'blue' | 'red' | 'white';
}

/**
 * Signature futuristic ECG heartbeat trace.
 * A faint base line with a glowing pulse segment travelling on loop.
 * Light-theme default (blue on white); "white" variant for dark cards.
 */
export function LifeCareEcgLine({ variant = 'blue' }: LifeCareEcgLineProps) {
  const isRed = variant === 'red';
  const isWhite = variant === 'white';

  return (
    <svg
      viewBox="0 0 1200 140"
      preserveAspectRatio="none"
      className="w-full h-full"
      aria-hidden="true"
    >
      {!isRed && !isWhite && (
        <defs>
          <linearGradient id="svcEcgStroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#102BDC" />
            <stop offset="0.5" stopColor="#3B82F6" />
            <stop offset="1" stopColor="#4F46E5" />
          </linearGradient>
        </defs>
      )}

      {/* Faint base trace */}
      <path
        d={ECG_PATH}
        fill="none"
        stroke={
          isWhite
            ? 'rgba(255,255,255,0.25)'
            : isRed
              ? 'rgba(190,18,60,0.18)'
              : 'rgba(15,23,42,0.08)'
        }
        strokeWidth="1.1"
      />

      {/* Travelling glowing pulse */}
      <path
        d={ECG_PATH}
        fill="none"
        stroke={
          isWhite ? '#FFFFFF' : isRed ? '#FB7185' : 'url(#svcEcgStroke)'
        }
        strokeWidth="2"
        strokeLinecap="round"
        pathLength={1200}
        className={
          isWhite ? 'svc-ecg-white' : isRed ? 'svc-ecg-red' : 'svc-ecg svc-ecg-glow'
        }
      />

      {/* Secondary pulse, delayed for rhythm */}
      <path
        d={ECG_PATH}
        fill="none"
        stroke={
          isWhite ? 'rgba(255,255,255,0.7)' : isRed ? '#FDA4AF' : '#4F46E5'
        }
        strokeWidth="1.4"
        strokeLinecap="round"
        pathLength={1200}
        className={isWhite ? 'svc-ecg-white' : isRed ? 'svc-ecg-red' : 'svc-ecg'}
        style={{ animationDelay: '1.7s', opacity: 0.5 }}
      />
    </svg>
  );
}