export interface Doctor {
  id: string;
  num: string;
  name: string;
  designation: string;
  photo: string;
  qualifications: string;
  specialties: string[];
  description: string;
}

const RAW_DOCTORS: Array<Omit<Doctor, 'num'>> = [
  {
    id: 'bandaranayaka',
    name: 'Dr. H.M.M.S Bandaranayaka',
    designation: 'Chief Medical Consultant',
    photo: '/demos/hospital/doctor-1.jpeg',
    qualifications: 'MBBS (Colombo), MD (Medicine), MRCP (UK)',
    specialties: [
      'General Medicine',
      'Diabetes & Blood Pressure',
      'Preventive Health',
    ],
    description:
      'The founder and chief consultant of LifeCare Hospital. He leads our medical team with decades of experience and one simple belief — every patient deserves time, respect and clear answers.',
  },
  {
    id: 'wickramasinghe',
    name: 'Dr. Anura Wickramasinghe',
    designation: 'Consultant Cardiologist',
    photo: '/demos/hospital/doctor-3.jpeg',
    qualifications: 'MBBS (Colombo), MD (Cardiology), MRCP (UK)',
    specialties: ['Heart Disease', 'ECG & Echocardiography', 'Blood Pressure Care'],
    description:
      'Cares for patients with heart disease and high blood pressure. He studies your ECG and monitoring results carefully, then explains everything in words you can understand.',
  },
  {
    id: 'fernando',
    name: 'Dr. Samanthi Fernando',
    designation: 'Pediatric Specialist',
    photo: '/demos/hospital/doctor-2.jpeg',
    qualifications: 'MBBS (Colombo), MD (Paediatrics), MRCPCH (UK)',
    specialties: ['Child Health', 'Newborn Care', 'Vaccination'],
    description:
      'Looks after babies and children of all ages. From newborn checks to vaccination and childhood illnesses, she makes every visit calm, gentle and friendly for both child and parent.',
  },
  {
    id: 'dissanayake',
    name: 'Dr. Priyantha Dissanayake',
    designation: 'General & Laparoscopic Surgeon',
    photo: '/demos/hospital/doctor-4.jpeg',
    qualifications: 'MBBS (Colombo), MS (Surgery), MRCS (Edin)',
    specialties: ['Laparoscopic Surgery', 'General Surgery', 'Endoscopy'],
    description:
      'Performs keyhole and general surgeries in our fully equipped theatre. Smaller cuts, less pain and faster recovery — with careful follow-up until you are fully healed.',
  },
  {
    id: 'ratnayake',
    name: 'Dr. Menaka Ratnayake',
    designation: 'Consultant Physician (VOG)',
    photo: '/demos/hospital/doctor-5.jpeg',
    qualifications: 'MBBS (Colombo), MD (Obstetrics & Gynaecology), MRCOG (UK)',
    specialties: ['Pregnancy Care', 'Women’s Health', '4D & 2D Scans'],
    description:
      'Cares for mothers before, during and after pregnancy. She also supports women’s health at every age — with scans, check-ups and kind, private advice.',
  },
  {
    id: 'jayasuriya',
    name: 'Dr. Kanishka Jayasuriya',
    designation: 'Consultant Eye Surgeon',
    photo: '/demos/hospital/doctor-6.jpeg',
    qualifications: 'MBBS (Colombo), MS (Ophthalmology), FRCS (Edin)',
    specialties: ['Cataract Surgery', 'Vision Testing', 'Diabetic Eye Care'],
    description:
      'An eye surgeon who performs modern cataract surgery and full vision testing. He explains every step before treatment, so you always know what happens next.',
  },
];

export const DOCTORS: Doctor[] = RAW_DOCTORS.map((doctor, index) => ({
  ...doctor,
  num: String(index + 1).padStart(2, '0'),
}));