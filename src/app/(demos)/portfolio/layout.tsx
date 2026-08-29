import React from 'react';
import type { Metadata } from 'next';
import { DemoToastProvider } from '@/components/demos/DemoToastContext';
import { DemoPreviewToolbar } from '@/components/demos/DemoPreviewToolbar';

export const metadata: Metadata = {
  title: 'Client Demo Preview | BizRavana Web Design',
  description: 'Interactive concept demo built with modern, ultra-fast web standards by BizRavana.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DemosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoToastProvider>
      <div className="relative min-h-screen bg-slate-950 text-slate-50 selection:bg-amber-500 selection:text-black">
        {/* Render child demo landing page without BizRavana main nav or footer */}
        <main className="w-full min-h-screen">
          {children}
        </main>

        {/* Global floating preview toolbar for lead conversions */}
        <DemoPreviewToolbar />
      </div>
    </DemoToastProvider>
  );
}
