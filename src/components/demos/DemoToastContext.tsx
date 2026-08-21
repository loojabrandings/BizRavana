'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DemoToastContextType {
  showDemoToast: (title?: string, message?: string) => void;
}

const DemoToastContext = createContext<DemoToastContextType>({
  showDemoToast: () => {},
});

export const useDemoToast = () => useContext(DemoToastContext);

export const DemoToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{ id: number; title: string; message: string } | null>(null);

  const showDemoToast = (
    title = 'Demo Interaction',
    message = 'In your production website, this action instantly books appointments and notifies your team via WhatsApp or Email.'
  ) => {
    const id = Date.now();
    setToast({ id, title, message });

    setTimeout(() => {
      setToast((curr) => (curr?.id === id ? null : curr));
    }, 4500);
  };

  return (
    <DemoToastContext.Provider value={{ showDemoToast }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-24 right-4 sm:right-8 z-50 max-w-sm w-full bg-slate-950/90 border border-amber-500/30 backdrop-blur-xl p-4 rounded-2xl shadow-2xl shadow-amber-500/10 text-white pointer-events-auto"
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400 text-sm font-bold">
                ✓
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-1">
                  {toast.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {toast.message}
                </p>
              </div>
              <button
                onClick={() => setToast(null)}
                className="text-slate-400 hover:text-white text-xs p-1"
                aria-label="Close Notification"
              >
                ✕
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </DemoToastContext.Provider>
  );
};
