import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Doctor Channelling — Book a Specialist | LifeCare Hospital Balangoda',
  description:
    'Channel a specialist at LifeCare Hospital Balangoda — VOG, paediatrics, physician, dermatology, psychiatry, endocrinology, eye and surgery clinics with dedicated consultants.',
};

export default function LifeCareChannelingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}