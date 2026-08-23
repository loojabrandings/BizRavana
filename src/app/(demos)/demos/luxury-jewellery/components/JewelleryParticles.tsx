'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function JewelleryParticles({ count = 20, className = '' }: { count?: number; className?: string }) {
  // Generate stable deterministic particle positions
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: (i * 17) % 100,
    y: (i * 23) % 100,
    size: 2 + ((i * 3) % 4),
    duration: 5 + ((i * 7) % 6),
    delay: (i * 0.4) % 4,
    drift: ((i % 2 === 0 ? 1 : -1) * (15 + (i * 5) % 25)),
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none z-0 ${className}`}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            opacity: 0,
            x: `${p.x}vw`,
            y: `${p.y + 10}vh`,
            scale: 0.6,
          }}
          animate={{
            opacity: [0, 0.7, 0.9, 0.2, 0],
            y: [`${p.y + 10}vh`, `${p.y - 30}vh`],
            x: [`${p.x}vw`, `${p.x + p.drift / 5}vw`],
            scale: [0.6, 1.2, 1, 0.5],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: 'easeInOut',
          }}
          className="absolute rounded-full bg-[#dfbe82] shadow-[0_0_8px_#C6A05F]"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
          }}
        />
      ))}
    </div>
  );
}
