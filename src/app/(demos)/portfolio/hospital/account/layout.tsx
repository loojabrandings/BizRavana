'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LifeCareNavbar } from '../components/LifeCareNavbar';
import { PatientSidebar } from '../components/PatientSidebar';
import { useLifeCareAuth } from '../hooks/useLifeCareAuth';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, hydrated, logout } = useLifeCareAuth();

  // Redirect AFTER hydration confirms there's no user
  useEffect(() => {
    if (hydrated && !user) {
      router.push('/portfolio/hospital');
    }
  }, [hydrated, user, router]);

  // Show loading spinner while hydrating or if not logged in
  if (!hydrated || !user) {
    return (
      <div className="min-h-screen w-full bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#102BDC] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="font-inter text-sm text-[#64748B]">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/portfolio/hospital');
  };

  return (
    <div className="min-h-screen w-full bg-[#F8FAFC] text-[#0D1527] selection:bg-[#102BDC] selection:text-white">
      {/* Navbar */}
      <LifeCareNavbar activePage="Home" />

      {/* Main Content */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 pt-24 sm:pt-28 pb-12">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Sidebar */}
          <PatientSidebar patientName={user} onLogout={handleLogout} />

          {/* Page Content */}
          <main className="flex-1 min-w-0 w-full">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
