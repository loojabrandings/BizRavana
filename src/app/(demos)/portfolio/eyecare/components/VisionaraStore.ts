'use client';

import { create } from 'zustand';

interface VisionaraState {
  // Theme
  effectiveTheme: 'light' | 'dark';
  setEffectiveTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Services
  activeServiceId: string;
  setActiveServiceId: (id: string) => void;

  // Eyewear
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  activeFrameId: string;
  setActiveFrameId: (id: string) => void;
  activeColorIdx: number;
  setActiveColorIdx: (idx: number) => void;

  // Doctors
  activeDoctorId: string;
  setActiveDoctorId: (id: string) => void;

  // FAQ
  openFaqIndex: number | null;
  setOpenFaqIndex: (idx: number | null) => void;

  // Booking
  selectedBranch: string;
  setSelectedBranch: (branch: string) => void;
  selectedService: string;
  setSelectedService: (service: string) => void;
  selectedTimeSlot: string;
  setSelectedTimeSlot: (slot: string) => void;
  fullName: string;
  setFullName: (name: string) => void;
  phoneNumber: string;
  setPhoneNumber: (phone: string) => void;
  isSubmitted: boolean;
  setIsSubmitted: (submitted: boolean) => void;
}

export const useVisionaraStore = create<VisionaraState>((set) => ({
  // Theme
  effectiveTheme: 'dark',
  setEffectiveTheme: (effectiveTheme) => set({ effectiveTheme }),
  toggleTheme: () =>
    set((state) => ({
      effectiveTheme: state.effectiveTheme === 'dark' ? 'light' : 'dark',
    })),

  // Services
  activeServiceId: 'eye-exam',
  setActiveServiceId: (id) => set({ activeServiceId: id }),

  // Eyewear
  selectedFilter: 'titanium',
  setSelectedFilter: (filter) => set({ selectedFilter: filter }),
  activeFrameId: 'aero-titanium-01',
  setActiveFrameId: (id) => set({ activeFrameId: id }),
  activeColorIdx: 0,
  setActiveColorIdx: (idx) => set({ activeColorIdx: idx }),

  // Doctors
  activeDoctorId: 'dr-nimalka',
  setActiveDoctorId: (id) => set({ activeDoctorId: id }),

  // FAQ
  openFaqIndex: 0,
  setOpenFaqIndex: (idx) => set({ openFaqIndex: idx }),

  // Booking
  selectedBranch: 'colombo',
  setSelectedBranch: (branch) => set({ selectedBranch: branch }),
  selectedService: 'Full Digital Eye Checkup (Rs. 2,500)',
  setSelectedService: (service) => set({ selectedService: service }),
  selectedTimeSlot: 'Morning (9:30 AM - 12:30 PM)',
  setSelectedTimeSlot: (slot) => set({ selectedTimeSlot: slot }),
  fullName: '',
  setFullName: (name) => set({ fullName: name }),
  phoneNumber: '',
  setPhoneNumber: (phone) => set({ phoneNumber: phone }),
  isSubmitted: false,
  setIsSubmitted: (submitted) => set({ isSubmitted: submitted }),
}));
