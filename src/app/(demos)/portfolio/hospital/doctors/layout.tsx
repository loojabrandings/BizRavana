import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'Our Doctors — Meet the Specialists | LifeCare Hospital Balangoda',
  description:
    'Meet the specialist doctors of LifeCare Hospital Balangoda — their qualifications, specialties and how they care for you. Book a consultation today.',
};

export default function LifeCareDoctorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}