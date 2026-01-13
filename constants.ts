import { CategoryConfig, CategoryType } from './types';
import { GraduationCap, Award, Calendar, Handshake } from 'lucide-react';

export const CATEGORIES: Record<CategoryType, CategoryConfig> = {
  STUDENT: {
    id: 'STUDENT',
    label: 'Student Achievement',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    Icon: GraduationCap,
  },
  FACULTY: {
    id: 'FACULTY',
    label: 'Faculty Achievement',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    Icon: Award,
  },
  EVENT: {
    id: 'EVENT',
    label: 'Department Event',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    Icon: Calendar,
  },
  COLLAB: {
    id: 'COLLAB',
    label: 'Collaboration / MoU',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    Icon: Handshake,
  },
};

export const ADMIN_PIN = import.meta.env.VITE_ADMIN_PIN || "123456";
export const MAX_LOGIN_ATTEMPTS = 5;

// Initial seed data to populate the timeline if empty
export const SEED_DATA = [
  {
    id: '1',
    title: 'National Hackathon Winners',
    description: 'Our final year students secured 1st place in the Smart India Hackathon 2023, developing an AI-based solution for waste management.',
    category: 'STUDENT',
    date: '2023-11-15',
    year: 2023,
    featured: true,
    createdAt: Date.now(),
    mediaUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '2',
    title: 'International Conference on AI',
    description: 'Dr. Sarah Smith presented her paper on "Ethical AI Frameworks" at the IEEE International Conference in Singapore.',
    category: 'FACULTY',
    date: '2023-09-20',
    year: 2023,
    featured: false,
    createdAt: Date.now() - 10000,
  },
  {
    id: '3',
    title: 'Annual Tech Fest "Technova"',
    description: 'A 3-day technical symposium featuring coding contests, robotics workshops, and guest lectures from industry leaders.',
    category: 'EVENT',
    date: '2024-03-10',
    year: 2024,
    featured: true,
    createdAt: Date.now() - 20000,
    mediaUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: '4',
    title: 'MoU with Google Cloud',
    description: 'The department has signed a Memorandum of Understanding with Google Cloud to set up a Center of Excellence on campus.',
    category: 'COLLAB',
    date: '2024-01-15',
    year: 2024,
    featured: true,
    createdAt: Date.now() - 30000,
  }
] as const;