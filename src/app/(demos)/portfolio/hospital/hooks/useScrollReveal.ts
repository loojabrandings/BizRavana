'use client';

import { useEffect, useRef } from 'react';

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>() {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
      node.classList.add('is-visible');
      node.querySelectorAll('.reveal-fade-up, .reveal-slide-left, .reveal-slide-right, .reveal-scale-in').forEach((el) => {
        el.classList.add('is-visible');
      });
      return;
    }

    // Direct DOM manipulation - zero React re-rendering during scroll
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          node.classList.add('is-visible');
          node.querySelectorAll('.reveal-fade-up, .reveal-slide-left, .reveal-slide-right, .reveal-scale-in').forEach((el) => {
            el.classList.add('is-visible');
          });
          observer.unobserve(node);
        }
      },
      { threshold: 0.08, rootMargin: '50px 0px -20px 0px' }
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return ref;
}
