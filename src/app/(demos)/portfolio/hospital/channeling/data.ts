import type { LucideIcon } from 'lucide-react';
import {
  Baby,
  Smile,
  Stethoscope,
  Sparkles,
  Brain,
  Droplet,
  Eye,
  Scissors,
} from 'lucide-react';

export interface ChannelDoctor {
  name: string;
  designation: string;
  qualifications: string;
  /** Path to a portrait in /public — when null, an initials avatar is shown. */
  photo: string | null;
  initials: string;
  sessions: string;
}

export interface ChannelingSpecialty {
  id: string;
  num: string;
  specialty: string;
  tagline: string;
  icon: LucideIcon;
  doctor: ChannelDoctor;
}

const RAW_SPECIALTIES: Array<Omit<ChannelingSpecialty, 'num'>> = [
  {
    id: 'vog',
    specialty: 'Obstetrics & Gynaecology (VOG)',
    tagline: 'Pregnancy care, women’s health & scans',
    icon: Baby,
    doctor: {
      name: 'Dr. Menaka Ratnayake',
      designation: 'Consultant VOG',
      qualifications: 'MBBS (Colombo), MD (Obstetrics & Gynaecology), MRCOG (UK)',
      photo: '/demos/hospital/doctor-5.jpeg',
      initials: 'MR',
      sessions: 'Every Monday & Thursday · 4:00 PM – 8:00 PM',
    },
  },
  {
    id: 'paediatrics',
    specialty: 'Paediatrics (Child Care)',
    tagline: 'Care for babies, children & teens',
    icon: Smile,
    doctor: {
      name: 'Dr. Samanthi Fernando',
      designation: 'Consultant Paediatrician',
      qualifications: 'MBBS (Colombo), MD (Paediatrics), MRCPCH (UK)',
      photo: '/demos/hospital/doctor-2.jpeg',
      initials: 'SF',
      sessions: 'Every Tuesday & Saturday · 9:00 AM – 12:00 PM',
    },
  },
  {
    id: 'physician',
    specialty: 'General Medicine (Physician)',
    tagline: 'Fever, general illness & long-term conditions',
    icon: Stethoscope,
    doctor: {
      name: 'Dr. H.M.M.S Bandaranayaka',
      designation: 'Chief Medical Consultant',
      qualifications: 'MBBS (Colombo), MD (Medicine), MRCP (UK)',
      photo: '/demos/hospital/doctor-1.jpeg',
      initials: 'HB',
      sessions: 'Every weekday · 3:00 PM – 6:00 PM',
    },
  },
  {
    id: 'dermatology',
    specialty: 'Dermatology (Skin Diseases)',
    tagline: 'Skin, hair & nail problems',
    icon: Sparkles,
    doctor: {
      name: 'Dr. Nadeesha Perera',
      designation: 'Visiting Consultant Dermatologist',
      qualifications: 'MBBS (Colombo), MD (Dermatology)',
      photo: null,
      initials: 'NP',
      sessions: 'Every Wednesday · 5:00 PM – 8:00 PM',
    },
  },
  {
    id: 'psychiatry',
    specialty: 'Psychiatry (Mental Health)',
    tagline: 'Stress, anxiety, sleep & mental wellbeing',
    icon: Brain,
    doctor: {
      name: 'Dr. Ruwan Weerasinghe',
      designation: 'Visiting Consultant Psychiatrist',
      qualifications: 'MBBS (Colombo), MD (Psychiatry)',
      photo: null,
      initials: 'RW',
      sessions: 'Every 2nd & 4th Saturday · 10:00 AM – 1:00 PM',
    },
  },
  {
    id: 'endocrinology',
    specialty: 'Endocrinology (Hormones & Diabetes)',
    tagline: 'Diabetes, thyroid & hormone balance',
    icon: Droplet,
    doctor: {
      name: 'Dr. Ishara Madushani',
      designation: 'Visiting Consultant Endocrinologist',
      qualifications: 'MBBS (Colombo), MD (Endocrinology), MRCP (UK)',
      photo: null,
      initials: 'IM',
      sessions: 'Every Friday · 4:00 PM – 7:00 PM',
    },
  },
  {
    id: 'ophthalmology',
    specialty: 'Ophthalmology (Eye Diseases)',
    tagline: 'Vision testing, cataracts & eye care',
    icon: Eye,
    doctor: {
      name: 'Dr. Kanishka Jayasuriya',
      designation: 'Consultant Eye Surgeon',
      qualifications: 'MBBS (Colombo), MS (Ophthalmology), FRCS (Edin)',
      photo: '/demos/hospital/doctor-6.jpeg',
      initials: 'KJ',
      sessions: 'Every Tuesday & Sunday · 9:00 AM – 1:00 PM',
    },
  },
  {
    id: 'surgery',
    specialty: 'General & Laparoscopic Surgery',
    tagline: 'Keyhole & general operations',
    icon: Scissors,
    doctor: {
      name: 'Dr. Priyantha Dissanayake',
      designation: 'Consultant Surgeon',
      qualifications: 'MBBS (Colombo), MS (Surgery), MRCS (Edin)',
      photo: '/demos/hospital/doctor-4.jpeg',
      initials: 'PD',
      sessions: 'Every Wednesday & Saturday · 4:00 PM – 7:00 PM',
    },
  },
];

export const CHANNELING_SPECIALTIES: ChannelingSpecialty[] = RAW_SPECIALTIES.map(
  (item, index) => ({
    ...item,
    num: String(index + 1).padStart(2, '0'),
  }),
);