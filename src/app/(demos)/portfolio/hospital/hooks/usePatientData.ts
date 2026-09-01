'use client';

import { useState, useEffect, useCallback } from 'react';

// ── Types ──────────────────────────────────────────────────────────────────

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  bloodGroup: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
    expiry: string;
  };
}

export interface Appointment {
  id: string;
  patientId: string;
  doctor: string;
  department: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  notes?: string;
}

export interface ChannelingSession {
  id: string;
  patientId: string;
  doctor: string;
  specialty: string;
  date: string;
  status: 'completed' | 'no-show' | 'cancelled';
  notes?: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctor: string;
  date: string;
  medications: Array<{
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
  }>;
  notes?: string;
}

export interface LabResult {
  id: string;
  patientId: string;
  testName: string;
  date: string;
  status: 'ready' | 'pending';
  resultUrl?: string;
  values?: Array<{
    name: string;
    value: string;
    unit: string;
    normalRange: string;
  }>;
}

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_PATIENT: Patient = {
  id: 'pat-001',
  name: 'Kasun Perera',
  email: 'kasun.perera@email.com',
  phone: '077 123 4567',
  dateOfBirth: '1990-05-15',
  bloodGroup: 'B+',
  emergencyContact: {
    name: 'Nadeeja Perera',
    phone: '071 987 6543',
    relationship: 'Spouse',
  },
  insurance: {
    provider: 'Lanka Insurance Ltd',
    policyNumber: 'LI-2024-78541',
    expiry: '2026-12-31',
  },
};

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-001',
    patientId: 'pat-001',
    doctor: 'Dr. H.M.M.S Bandaranayaka',
    department: 'General Medicine',
    date: '2026-09-05',
    time: '03:30 PM',
    status: 'upcoming',
    notes: 'Follow-up for blood pressure monitoring',
  },
  {
    id: 'apt-002',
    patientId: 'pat-001',
    doctor: 'Dr. Kanishka Jayasuriya',
    department: 'Eye Care',
    date: '2026-09-12',
    time: '09:00 AM',
    status: 'upcoming',
  },
  {
    id: 'apt-003',
    patientId: 'pat-001',
    doctor: 'Dr. Samanthi Fernando',
    department: 'Paediatrics',
    date: '2026-08-20',
    time: '10:00 AM',
    status: 'completed',
    notes: 'Annual check-up completed. All vitals normal.',
  },
  {
    id: 'apt-004',
    patientId: 'pat-001',
    doctor: 'Dr. Menaka Ratnayake',
    department: 'Obstetrics & Gynaecology',
    date: '2026-08-05',
    time: '04:30 PM',
    status: 'completed',
  },
  {
    id: 'apt-005',
    patientId: 'pat-001',
    doctor: 'Dr. Nadeesha Perera',
    department: 'Dermatology',
    date: '2026-07-15',
    time: '05:30 PM',
    status: 'cancelled',
    notes: 'Patient requested cancellation due to travel.',
  },
];

const MOCK_CHANNELING: ChannelingSession[] = [
  {
    id: 'ch-001',
    patientId: 'pat-001',
    doctor: 'Dr. H.M.M.S Bandaranayaka',
    specialty: 'General Medicine (Physician)',
    date: '2026-08-20',
    status: 'completed',
    notes: 'Prescribed medication for 2 weeks. Follow-up in 14 days.',
  },
  {
    id: 'ch-002',
    patientId: 'pat-001',
    doctor: 'Dr. Kanishka Jayasuriya',
    specialty: 'Ophthalmology (Eye Diseases)',
    date: '2026-07-10',
    status: 'completed',
    notes: 'Vision test normal. No changes to prescription needed.',
  },
  {
    id: 'ch-003',
    patientId: 'pat-001',
    doctor: 'Dr. Ishara Madushani',
    specialty: 'Endocrinology (Hormones & Diabetes)',
    date: '2026-06-28',
    status: 'completed',
  },
  {
    id: 'ch-004',
    patientId: 'pat-001',
    doctor: 'Dr. Ruwan Weerasinghe',
    specialty: 'Psychiatry (Mental Health)',
    date: '2026-06-14',
    status: 'no-show',
  },
];

const MOCK_PRESCRIPTIONS: Prescription[] = [
  {
    id: 'rx-001',
    patientId: 'pat-001',
    doctor: 'Dr. H.M.M.S Bandaranayaka',
    date: '2026-08-20',
    medications: [
      { name: 'Amlodipine', dosage: '5mg', frequency: 'Once daily', duration: '14 days' },
      { name: 'Aspirin', dosage: '75mg', frequency: 'Once daily (after food)', duration: 'Ongoing' },
    ],
    notes: 'Monitor blood pressure daily. Avoid salty foods.',
  },
  {
    id: 'rx-002',
    patientId: 'pat-001',
    doctor: 'Dr. Kanishka Jayasuriya',
    date: '2026-07-10',
    medications: [
      { name: 'Artificial Tears', dosage: '1 drop', frequency: '3 times daily', duration: '30 days' },
    ],
    notes: 'Use before screen time. Reduce screen exposure.',
  },
  {
    id: 'rx-003',
    patientId: 'pat-001',
    doctor: 'Dr. Ishara Madushani',
    date: '2026-06-28',
    medications: [
      { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily (with meals)', duration: '30 days' },
      { name: 'Vitamin D3', dosage: '1000 IU', frequency: 'Once weekly', duration: '8 weeks' },
    ],
    notes: 'Continue diabetes management. HbA1c to be checked in 3 months.',
  },
];

const MOCK_LAB_RESULTS: LabResult[] = [
  {
    id: 'lab-001',
    patientId: 'pat-001',
    testName: 'Complete Blood Count (CBC)',
    date: '2026-08-18',
    status: 'ready',
    values: [
      { name: 'Haemoglobin', value: '14.2', unit: 'g/dL', normalRange: '13.0 – 17.0' },
      { name: 'WBC Count', value: '7.5', unit: '×10³/µL', normalRange: '4.0 – 11.0' },
      { name: 'Platelet Count', value: '245', unit: '×10³/µL', normalRange: '150 – 400' },
      { name: 'RBC Count', value: '4.8', unit: '×10⁶/µL', normalRange: '4.5 – 5.5' },
    ],
  },
  {
    id: 'lab-002',
    patientId: 'pat-001',
    testName: 'Lipid Profile',
    date: '2026-08-18',
    status: 'ready',
    values: [
      { name: 'Total Cholesterol', value: '210', unit: 'mg/dL', normalRange: '< 200' },
      { name: 'HDL Cholesterol', value: '48', unit: 'mg/dL', normalRange: '> 40' },
      { name: 'LDL Cholesterol', value: '130', unit: 'mg/dL', normalRange: '< 100' },
      { name: 'Triglycerides', value: '155', unit: 'mg/dL', normalRange: '< 150' },
    ],
  },
  {
    id: 'lab-003',
    patientId: 'pat-001',
    testName: 'Blood Glucose (Fasting)',
    date: '2026-08-18',
    status: 'ready',
    values: [
      { name: 'Fasting Glucose', value: '105', unit: 'mg/dL', normalRange: '70 – 100' },
      { name: 'HbA1c', value: '6.2', unit: '%', normalRange: '< 5.7' },
    ],
  },
  {
    id: 'lab-004',
    patientId: 'pat-001',
    testName: 'Thyroid Function Test',
    date: '2026-09-01',
    status: 'pending',
  },
  {
    id: 'lab-005',
    patientId: 'pat-001',
    testName: 'Liver Function Test',
    date: '2026-07-05',
    status: 'ready',
    values: [
      { name: 'SGOT (AST)', value: '28', unit: 'U/L', normalRange: '5 – 40' },
      { name: 'SGPT (ALT)', value: '32', unit: 'U/L', normalRange: '7 – 56' },
      { name: 'Alkaline Phosphatase', value: '78', unit: 'U/L', normalRange: '44 – 147' },
    ],
  },
];

// ── Hook ───────────────────────────────────────────────────────────────────

export function usePatientData() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [channelingHistory, setChannelingHistory] = useState<ChannelingSession[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate async data fetch
    const timer = setTimeout(() => {
      setPatient(MOCK_PATIENT);
      setAppointments(MOCK_APPOINTMENTS);
      setChannelingHistory(MOCK_CHANNELING);
      setPrescriptions(MOCK_PRESCRIPTIONS);
      setLabResults(MOCK_LAB_RESULTS);
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const upcomingAppointments = appointments.filter((a) => a.status === 'upcoming');
  const pastAppointments = appointments.filter((a) => a.status !== 'upcoming');
  const pendingResults = labResults.filter((l) => l.status === 'pending');
  const readyResults = labResults.filter((l) => l.status === 'ready');

  const cancelAppointment = useCallback((id: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: 'cancelled' as const } : apt))
    );
  }, []);

  return {
    patient,
    appointments,
    upcomingAppointments,
    pastAppointments,
    channelingHistory,
    prescriptions,
    labResults,
    pendingResults,
    readyResults,
    loading,
    cancelAppointment,
  };
}
