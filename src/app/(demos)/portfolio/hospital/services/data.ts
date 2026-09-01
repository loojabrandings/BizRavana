import type { LucideIcon } from 'lucide-react';
import {
  Siren,
  FlaskConical,
  BedDouble,
  ScanLine,
  Activity,
  Syringe,
  PersonStanding,
  ScanSearch,
  ClipboardCheck,
  Radiation,
  Scissors,
  Smile,
  Sparkles,
  Scale,
  Baby,
  Pill,
  Brain,
  Heart,
  Waves,
  Ear,
  Microscope,
  Users,
  Watch,
  Gauge,
  Scan,
  Cross,
  Ambulance,
} from 'lucide-react';

export type ServiceCategoryId =
  | 'emergency'
  | 'tests'
  | 'surgery'
  | 'specialist'
  | 'family'
  | 'everyday';

export interface ServiceCategory {
  id: ServiceCategoryId;
  label: string;
  code: string;
}

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'emergency', label: 'Emergency & 24/7', code: 'EMG' },
  { id: 'tests', label: 'Scans & Tests', code: 'LAB' },
  { id: 'surgery', label: 'Surgery & Theatre', code: 'OT' },
  { id: 'specialist', label: 'Special Care Units', code: 'UNIT' },
  { id: 'family', label: 'Mother & Child', code: 'M+C' },
  { id: 'everyday', label: 'Everyday Care', code: 'CARE' },
];

export interface HospitalService {
  id: string;
  num: string;
  title: string;
  simple: string;
  category: ServiceCategoryId;
  is24h?: boolean;
  icon: LucideIcon;
  points: string[];
}

type RawService = Omit<HospitalService, 'num' | 'points'>;

const RAW_SERVICES: RawService[] = [
  {
    id: 'etu-opd',
    title: 'ETU & OPD',
    simple:
      'Walk in any time, day or night. Our emergency team treats accidents and sudden illness fast. You do not need an appointment — just come to the hospital and we will help you right away.',
    category: 'emergency',
    is24h: true,
    icon: Siren,
  },
  {
    id: 'laboratory',
    title: 'Laboratory',
    simple:
      'Blood tests, urine tests and many more lab tests. Open 24 hours, so you can get tested even at night. Your samples are checked carefully, and your report is made ready as fast as possible.',
    category: 'tests',
    is24h: true,
    icon: FlaskConical,
  },
  {
    id: 'ward',
    title: 'Ward',
    simple:
      'Clean, comfortable rooms for patients who need to stay in the hospital. Our nurses check on you day and night. Healthy meals, medicine and personal care are provided until you are ready to go home.',
    category: 'everyday',
    icon: BedDouble,
  },
  {
    id: 'scan-4d-2d',
    title: '4D Scan & 2D Scan',
    simple:
      'Safe ultrasound scans for mothers. See clear pictures of your baby before birth, with moving images in 4D. It is a happy moment for parents — and a useful health check for the baby.',
    category: 'tests',
    icon: ScanLine,
  },
  {
    id: 'ecg',
    title: 'E.C.G.',
    simple:
      'A quick, painless test that records the electric signals of your heart. Small pads are placed on your chest — no needles, no pain. It helps doctors find heart problems early and plan the right treatment.',
    category: 'tests',
    icon: Activity,
  },
  {
    id: 'immunization',
    title: 'Immunization Unit',
    simple:
      'Vaccines for babies, children and adults. They protect your family from dangerous diseases like measles and polio. Our nurses keep a full record of every dose, so you never miss the next one.',
    category: 'family',
    icon: Syringe,
  },
  {
    id: 'physiotherapy',
    title: 'Physiotherapy Unit',
    simple:
      'Exercises and therapy that help your body move again after an injury or surgery. Each session is one-on-one with a trained therapist. A personal plan is made for your body, step by step.',
    category: 'specialist',
    icon: PersonStanding,
  },
  {
    id: 'endoscopy',
    title: 'Endoscopy & Colonoscopy',
    simple:
      'A thin, flexible camera checks inside your stomach and gut. It helps doctors find problems like pain, bleeding or ulcers early. The test is done by experienced doctors, and you will not feel pain during it.',
    category: 'tests',
    icon: ScanSearch,
  },
  {
    id: 'health-checkup',
    title: 'Health Check Up',
    simple:
      'One visit, many tests. A full body check-up — blood, urine, heart and more — to catch problems before they start. Your report is explained to you in simple words, with clear next steps.',
    category: 'everyday',
    icon: ClipboardCheck,
  },
  {
    id: 'digital-xray',
    title: 'Digital X-Ray',
    simple:
      'Fast, clear X-ray pictures using modern digital machines. The radiation is very low and completely safe. Your images are ready in minutes, so your doctor can start treatment without delay.',
    category: 'tests',
    icon: Radiation,
  },
  {
    id: 'laparoscopy',
    title: 'Laparoscopy Surgery & Diagnostic Laparoscopy',
    simple:
      'Modern keyhole surgery done through very small cuts. It means less pain after the operation, smaller scars and faster healing. It is also used to look inside the body and find the cause of pain.',
    category: 'surgery',
    icon: Scissors,
  },
  {
    id: 'dental',
    title: 'Dental Unit',
    simple:
      'Complete care for your teeth — check-ups, cleaning, fillings, removal and more. Our dental team is gentle with kids and careful with adults. Regular visits keep your teeth healthy and pain-free.',
    category: 'specialist',
    icon: Smile,
  },
  {
    id: 'skin-care',
    title: 'Skin Care Unit',
    simple:
      'Treatment for skin problems like rashes, acne, infections and allergies. A private and friendly consultation to understand your skin. You also get simple advice to follow at home for healthy skin.',
    category: 'specialist',
    icon: Sparkles,
  },
  {
    id: 'slimming',
    title: 'Slimming Center',
    simple:
      'Safe weight-loss support with a plan made just for you. Simple diet advice, step-by-step targets and friendly guidance at every visit. No risky shortcuts — just a healthier you, at your own pace.',
    category: 'specialist',
    icon: Scale,
  },
  {
    id: 'baby-care',
    title: 'Baby Care Unit',
    simple:
      'Special care for newborns and small babies. We check weight and growth, support mothers with feeding, and answer your questions with patience. Gentle, trained hands take care of your little one.',
    category: 'family',
    icon: Baby,
  },
  {
    id: 'pharmacy',
    title: 'Pharmacy',
    simple:
      'Our pharmacy is right inside the hospital. Show your prescription and a qualified pharmacist prepares genuine, safe medicines for you. We check every medicine carefully before handing it over.',
    category: 'everyday',
    icon: Pill,
  },
  {
    id: 'neuro-rehab',
    title: 'Neuro & Rehabilitation Unit',
    simple:
      'Care for problems of the brain, nerves and muscles. After a stroke or injury, recovery takes time — we help you step by step. Therapy builds your strength, balance and confidence again.',
    category: 'specialist',
    icon: Brain,
  },
  {
    id: 'fertility',
    title: 'Fertility Center',
    simple:
      'Kind, private support for couples who dream of having a baby. We offer tests and treatments for both partners, explained clearly and honestly. Everything is confidential and handled with care.',
    category: 'family',
    icon: Heart,
  },
  {
    id: 'eeg',
    title: 'E.E.G Test',
    simple:
      'A painless test that records the electric activity of your brain. Small sensors rest on your head — nothing goes into the body. It helps doctors find out why fits or blackouts happen.',
    category: 'tests',
    icon: Waves,
  },
  {
    id: 'pta',
    title: 'P.T.A. Test',
    simple:
      'A simple hearing test for each ear. You listen to different sounds and tell us when you hear them — no needles at all. The results show how well you hear and are explained to you clearly.',
    category: 'tests',
    icon: Ear,
  },
  {
    id: 'fnac',
    title: 'F.N.A.C.',
    simple:
      'A very small needle takes a tiny sample from a lump or swelling. The test is quick and mostly painless. Checking lumps early like this helps doctors give you the right treatment fast.',
    category: 'tests',
    icon: Microscope,
  },
  {
    id: 'elderly-care',
    title: 'Elderly Care Unit',
    simple:
      'Respectful care for older adults. We help with daily activities, regular health checks and medicine on time. A safe, comfortable place where elders are treated with patience and kindness.',
    category: 'specialist',
    icon: Users,
  },
  {
    id: 'holter',
    title: '24 hrs Holter Monitoring',
    simple:
      'A small device you wear at home for a full day. It records your heart while you do your normal activities. This shows hidden rhythm problems that a short clinic test can miss.',
    category: 'tests',
    icon: Watch,
  },
  {
    id: 'bp-monitoring',
    title: '24 hrs BP Monitoring',
    simple:
      'A small, comfortable device checks your blood pressure for 24 hours, day and night. It takes readings automatically while you work, rest and sleep. The full picture helps your doctor treat you correctly.',
    category: 'tests',
    icon: Gauge,
  },
  {
    id: 'ct-mri-referral',
    title: 'Referral Center for CT & MRI Scan',
    simple:
      'Need a CT or MRI scan? We connect you to a trusted scan center near you, fast. We guide you step by step and make sure your reports reach the right doctor without confusion.',
    category: 'tests',
    icon: Scan,
  },
  {
    id: 'theatre',
    title: 'Fully Equipped Theatre',
    simple:
      'A modern, sterile operating theatre with a skilled surgical team. Every instrument and machine is checked and safe. Careful monitoring continues before, during and after your operation.',
    category: 'surgery',
    icon: Cross,
  },
  {
    id: 'ambulance',
    title: 'Ambulance Service',
    simple:
      'In an emergency, one call brings our ambulance to you. Trained staff care for you on the way to the hospital. The service is ready at any hour — day, night and every holiday.',
    category: 'emergency',
    is24h: true,
    icon: Ambulance,
  },
];

export const SERVICE_POINTS: Record<string, string[]> = {
  'etu-opd': [
    'Open all day and night, every day',
    'No appointment needed — just walk in',
    'Fast care for accidents and sudden illness',
  ],
  laboratory: [
    'Blood, urine and other lab tests',
    'Quick and accurate reports',
    'Open 24 hours — even on holidays',
  ],
  ward: [
    'Private rooms with a comfortable bed',
    'Nurses check on you day and night',
    'Healthy meals served daily',
  ],
  'scan-4d-2d': [
    'Safe for mother and baby',
    'Clear pictures of your baby',
    'Done by trained scan staff',
  ],
  ecg: [
    'Takes only a few minutes',
    'No pain and no needles',
    'Helps find heart problems early',
  ],
  immunization: [
    'Vaccines for babies, children and adults',
    'Given by trained nurses',
    'Full record of every dose kept',
  ],
  physiotherapy: [
    'One-on-one therapy sessions',
    'Helps with pain, movement and strength',
    'A plan made for your body',
  ],
  endoscopy: [
    'Checks inside your stomach and gut',
    'Done by experienced doctors',
    'No pain during the test',
  ],
  'health-checkup': [
    'Blood, urine, heart and body checks',
    'One visit — many tests',
    'Report explained in simple words',
  ],
  'digital-xray': [
    'Very low radiation',
    'Clear digital images',
    'Report ready in minutes',
  ],
  laparoscopy: [
    'Very small cuts and scars',
    'Less pain after surgery',
    'Faster recovery and healing',
  ],
  dental: [
    'Check-ups, cleaning and fillings',
    'Gentle care for kids and adults',
    'Advice to keep teeth strong',
  ],
  'skin-care': [
    'Care for rashes, acne and allergies',
    'Private and friendly consultation',
    'Simple skin-care advice to follow',
  ],
  slimming: [
    'A weight plan made for you',
    'Diet advice in simple steps',
    'Friendly support at every visit',
  ],
  'baby-care': [
    'Weight and growth checks',
    'Feeding support for mothers',
    'Gentle care by trained staff',
  ],
  pharmacy: [
    'Genuine and safe medicines',
    'Every prescription checked',
    'Right inside the hospital',
  ],
  'neuro-rehab': [
    'Care for brain and nerve problems',
    'Step-by-step recovery plan',
    'Therapy for strength and balance',
  ],
  fertility: [
    'Private and confidential care',
    'Tests and treatment for both partners',
    'Kind guidance at every step',
  ],
  eeg: [
    'Records the signals of your brain',
    'No pain and no needles',
    'Helps doctors find why fits happen',
  ],
  pta: [
    'Checks the hearing of each ear',
    'Simple sounds — no needles',
    'Results explained clearly',
  ],
  fnac: [
    'A very small needle, tiny sample',
    'Quick and mostly painless',
    'Helps check lumps early',
  ],
  'elderly-care': [
    'Help with daily activities',
    'Regular health checks',
    'Safe, comfortable and respectful care',
  ],
  holter: [
    'A small device you wear at home',
    'Records your heart for a full day',
    'Finds hidden heart rhythm problems',
  ],
  'bp-monitoring': [
    'Checks your blood pressure day and night',
    'Small and comfortable to wear',
    'Shows a full 24-hour picture',
  ],
  'ct-mri-referral': [
    'Fast booking at a trusted scan center',
    'We guide you step by step',
    'Your reports shared with your doctor',
  ],
  theatre: [
    'Sterile, modern operating room',
    'Skilled surgical and nursing team',
    'Careful monitoring before and after',
  ],
  ambulance: [
    'One call brings the ambulance to you',
    'Trained staff care for you on the way',
    'Ready at any hour, every day',
  ],
};

export const HOSPITAL_SERVICES: HospitalService[] = RAW_SERVICES.map(
  (service, index) => ({
    ...service,
    num: String(index + 1).padStart(2, '0'),
    points: SERVICE_POINTS[service.id] ?? [],
  }),
);