import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Our Services — 27 Medical Units | LifeCare Hospital Balangoda',
  description:
    'Explore every LifeCare Hospital service in simple words — 24-hour ETU & OPD, laboratory, scans, surgery, dental, physiotherapy, pharmacy, ambulance and more. Open 365 days in Balangoda.',
};

export default function LifeCareServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}