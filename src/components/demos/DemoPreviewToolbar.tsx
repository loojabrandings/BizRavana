'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface DemoPreviewToolbarProps {
  nicheLabel?: string;
}

export const DemoPreviewToolbar: React.FC<DemoPreviewToolbarProps> = ({
  nicheLabel = 'Live Concept Demo',
}) => {
  const [isMinimized, setIsMinimized] = useState(false);

  return (
    <aside aria-label="Demo Navigation Toolbar" className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-auto max-w-[95vw] pointer-events-auto">
      <AnimatePresence mode="wait">
        {isMinimized ? (
          <motion.button
            key="minimized"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setIsMinimized(false)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-950/90 hover:bg-slate-900 text-slate-200 border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs font-semibold tracking-wide transition-all"
            title="Expand BizRavana Demo Bar"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>BizRavana Preview</span>
            <span className="text-slate-400 text-xs">▲</span>
          </motion.button>
        ) : (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 sm:gap-4 px-3 sm:px-5 py-2.5 rounded-full bg-slate-950/90 border border-slate-800/90 shadow-2xl shadow-black/80 backdrop-blur-xl text-white text-xs"
          >
            {/* Tag */}
            <div className="flex items-center gap-2 pr-2 border-r border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
              <span className="font-semibold text-slate-300 hidden md:inline">
                {nicheLabel}
              </span>
            </div>

            {/* Prompt Text */}
            <p className="text-slate-300 hidden sm:block text-xs">
              Like this design for your business?
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center gap-2">
              <Link
                href="/services/web-design"
                className="px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-md transition-all whitespace-nowrap"
              >
                Get Yours Built
              </Link>
              <Link
                href="/contact"
                className="px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs transition-colors hidden xs:inline whitespace-nowrap"
              >
                Inquire
              </Link>
            </div>

            {/* Collapse toggle */}
            <button
              onClick={() => setIsMinimized(true)}
              className="p-1 text-slate-400 hover:text-slate-200 ml-1 transition-colors"
              title="Minimize bar"
              aria-label="Minimize preview toolbar"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  );
};
