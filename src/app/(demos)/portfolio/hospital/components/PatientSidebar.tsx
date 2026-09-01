'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Calendar,
  History,
  Pill,
  FileText,
  User,
  LogOut,
  ChevronRight,
} from 'lucide-react';

interface PatientSidebarProps {
  patientName: string;
  onLogout: () => void;
}

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/portfolio/hospital/account', icon: LayoutDashboard },
  { label: 'Appointments', href: '/portfolio/hospital/account/appointments', icon: Calendar },
  { label: 'Channeling History', href: '/portfolio/hospital/account/channeling', icon: History },
  { label: 'Prescriptions', href: '/portfolio/hospital/account/prescriptions', icon: Pill },
  { label: 'Medical Records', href: '/portfolio/hospital/account/records', icon: FileText },
  { label: 'Profile Settings', href: '/portfolio/hospital/account/profile', icon: User },
];

export function PatientSidebar({ patientName, onLogout }: PatientSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full lg:w-64 xl:w-72 shrink-0">
      {/* Patient Card — visible on all screens */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-5 sm:p-6 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#102BDC] text-white flex items-center justify-center font-dm-sans font-bold text-lg flex-shrink-0">
            {patientName.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="font-dm-sans font-bold text-base text-[#0D1527] truncate">
              {patientName}
            </p>
            <p className="font-inter text-xs text-[#64748B]">Patient Portal</p>
          </div>
        </div>
      </div>

      {/* Mobile: Horizontal scrollable tab bar */}
      <nav className="lg:hidden mb-4 -mx-4 sm:-mx-6 px-4 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isActive
                    ? 'bg-[#102BDC] text-white shadow-sm'
                    : 'bg-white border border-slate-200/80 text-[#475569] hover:border-[#102BDC]/30 hover:text-[#102BDC]'
                }`}
              >
                <Icon size={14} strokeWidth={isActive ? 2.2 : 1.8} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-medium whitespace-nowrap bg-white border border-slate-200/80 text-[#475569] hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all duration-200 shrink-0"
          >
            <LogOut size={14} strokeWidth={1.8} />
            <span>Log Out</span>
          </button>
        </div>
      </nav>

      {/* Desktop: Vertical sidebar nav */}
      <nav className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-3 hidden lg:block">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all duration-200 group ${
                    isActive
                      ? 'bg-[#102BDC]/10 text-[#102BDC] font-semibold'
                      : 'text-[#475569] hover:bg-slate-50 hover:text-[#0D1527]'
                  }`}
                >
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.2 : 1.8}
                    className={isActive ? 'text-[#102BDC]' : 'text-[#94A3B8] group-hover:text-[#475569]'}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isActive && (
                    <ChevronRight size={14} className="text-[#102BDC]" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Divider */}
        <div className="my-3 mx-4 border-t border-slate-100" />

        {/* Logout */}
        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium text-[#475569] hover:bg-rose-50 hover:text-rose-600 transition-all duration-200"
        >
          <LogOut size={18} strokeWidth={1.8} className="text-[#94A3B8] group-hover:text-rose-500" />
          <span>Log Out</span>
        </button>
      </nav>
    </aside>
  );
}
