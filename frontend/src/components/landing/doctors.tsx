'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShieldCheck, Clock, Video, Calendar, ArrowRight, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  qualification: string;
  experience: string;
  rating: number;
  reviewsCount: number;
  consultationFee: number;
  availability: string;
  isOnline: boolean;
  hospital: string;
  languages: string[];
  imageUrl: string;
  tags: string[];
}

const DOCTORS: DoctorProfile[] = [
  {
    id: 'doc-1',
    name: 'Dr. Ananya Sharma',
    specialty: 'Cardiologist',
    qualification: 'MD, DM (Cardiology), FACC',
    experience: '14+ yrs exp',
    rating: 4.9,
    reviewsCount: 328,
    consultationFee: 799,
    availability: 'Available Today',
    isOnline: true,
    hospital: 'Apollo Heart Institute',
    languages: ['English', 'Hindi'],
    imageUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=600',
    tags: ['Heart Specialist', 'ECG Analysis', 'Hypertension'],
  },
  {
    id: 'doc-2',
    name: 'Dr. Rajesh Verma',
    specialty: 'Neurologist',
    qualification: 'MBBS, MD, DM (Neurology)',
    experience: '18+ yrs exp',
    rating: 4.95,
    reviewsCount: 452,
    consultationFee: 899,
    availability: 'Next slot in 15 mins',
    isOnline: true,
    hospital: 'Max Super Speciality Hospital',
    languages: ['English', 'Hindi', 'Punjabi'],
    imageUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600',
    tags: ['Brain Health', 'Migraine Care', 'Stroke Rehab'],
  },
  {
    id: 'doc-3',
    name: 'Dr. Priya Mukherjee',
    specialty: 'Pediatrician',
    qualification: 'MBBS, DCH, DNB (Pediatrics)',
    experience: '11+ yrs exp',
    rating: 4.88,
    reviewsCount: 290,
    consultationFee: 599,
    availability: 'Available Today',
    isOnline: true,
    hospital: 'Rainbow Children’s Hospital',
    languages: ['English', 'Hindi', 'Bengali'],
    imageUrl: 'https://images.unsplash.com/photo-1594824813511-209252328701?auto=format&fit=crop&q=80&w=600',
    tags: ['Child Care', 'Vaccination', 'Newborn Care'],
  },
  {
    id: 'doc-4',
    name: 'Dr. Arjun Kapoor',
    specialty: 'Orthopedic Surgeon',
    qualification: 'MS (Ortho), M.Ch Orth (UK)',
    experience: '16+ yrs exp',
    rating: 4.92,
    reviewsCount: 512,
    consultationFee: 850,
    availability: 'Available in 30 mins',
    isOnline: true,
    hospital: 'Fortis Healthcare',
    languages: ['English', 'Hindi'],
    imageUrl: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=600',
    tags: ['Joint Replacement', 'Sports Injuries', 'Spine Care'],
  },
  {
    id: 'doc-5',
    name: 'Dr. Neha Sen',
    specialty: 'Dermatologist',
    qualification: 'MD (Dermatology, Venereology & Leprosy)',
    experience: '9+ yrs exp',
    rating: 4.85,
    reviewsCount: 215,
    consultationFee: 650,
    availability: 'Available Today',
    isOnline: false,
    hospital: 'Skin & Aesthetics Clinic',
    languages: ['English', 'Hindi'],
    imageUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=600',
    tags: ['Acne Treatment', 'Hair Loss', 'Cosmetic Care'],
  },
  {
    id: 'doc-6',
    name: 'Dr. Sanjay Gupta',
    specialty: 'General Physician',
    qualification: 'MD (Internal Medicine)',
    experience: '22+ yrs exp',
    rating: 4.96,
    reviewsCount: 680,
    consultationFee: 499,
    availability: 'Instant Connect Available',
    isOnline: true,
    hospital: 'Medanta - The Medicity',
    languages: ['English', 'Hindi', 'Gujarati'],
    imageUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=600',
    tags: ['Fever & Infection', 'Diabetes Care', 'Routine Checkup'],
  },
];

const SPECIALTIES = [
  'All Specialists',
  'Cardiologist',
  'Neurologist',
  'Pediatrician',
  'Orthopedic Surgeon',
  'Dermatologist',
  'General Physician',
];

export function DoctorsShowcase() {
  const [selectedSpecialty, setSelectedSpecialty] = useState('All Specialists');

  const filteredDoctors =
    selectedSpecialty === 'All Specialists'
      ? DOCTORS
      : DOCTORS.filter(doc => doc.specialty === selectedSpecialty);

  return (
    <section className='bg-slate-50/70 py-20 sm:py-28 border-y border-slate-100'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        {/* Section Header */}
        <div className='flex flex-col md:flex-row md:items-end md:justify-between gap-6'>
          <div className='max-w-2xl'>
            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-3'>
              <ShieldCheck className='h-3.5 w-3.5' /> Verified Specialists
            </div>
            <h2 className='text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl'>
              Consult India’s Top Certified Doctors
            </h2>
            <p className='mt-3 text-base sm:text-lg text-gray-600 leading-relaxed'>
              Skip the waiting room. Instant video consultations, verified digital prescriptions, and personalized healthcare advice from premier hospitals.
            </p>
          </div>

          <Button asChild variant='outline' className='self-start md:self-auto border-blue-200 text-blue-700 hover:bg-blue-50'>
            <Link href='/patient' className='flex items-center gap-2'>
              View All 500+ Doctors <ArrowRight className='h-4 w-4' />
            </Link>
          </Button>
        </div>

        {/* Filter Tabs */}
        <div className='mt-8 flex gap-2 overflow-x-auto pb-2 scrollbar-none'>
          {SPECIALTIES.map(specialty => (
            <button
              key={specialty}
              onClick={() => setSelectedSpecialty(specialty)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                selectedSpecialty === specialty
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100/80'
              }`}
            >
              {specialty}
            </button>
          ))}
        </div>

        {/* Doctors Grid */}
        <div className='mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8'>
          {filteredDoctors.map(doctor => (
            <div
              key={doctor.id}
              className='group bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col justify-between relative overflow-hidden'
            >
              {/* Status Glow */}
              <div className='absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity' />

              <div>
                {/* Doctor Avatar & Status */}
                <div className='flex items-start gap-4'>
                  <div className='relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border-2 border-white shadow-md'>
                    <Image
                      src={doctor.imageUrl}
                      alt={doctor.name}
                      fill
                      className='object-cover group-hover:scale-105 transition-transform duration-300'
                      sizes='96px'
                    />
                    {doctor.isOnline && (
                      <span className='absolute bottom-1.5 right-1.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full' title='Online now' />
                    )}
                  </div>

                  <div className='flex-1 min-w-0'>
                    <div className='flex items-center gap-1.5'>
                      <h3 className='text-lg font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors'>
                        {doctor.name}
                      </h3>
                      <ShieldCheck className='h-4 w-4 text-blue-600 shrink-0' title='NMC Verified Practitioner' />
                    </div>

                    <p className='text-sm font-semibold text-blue-600 mt-0.5'>{doctor.specialty}</p>
                    <p className='text-xs text-gray-500 truncate mt-0.5'>{doctor.qualification}</p>

                    <div className='flex items-center gap-3 mt-2 text-xs'>
                      <div className='flex items-center gap-1 text-amber-500 font-semibold bg-amber-50 px-2 py-0.5 rounded-md'>
                        <Star className='h-3.5 w-3.5 fill-current' />
                        <span>{doctor.rating}</span>
                        <span className='text-gray-400 font-normal'>({doctor.reviewsCount})</span>
                      </div>
                      <span className='text-gray-500 font-medium flex items-center gap-1'>
                        <Award className='h-3.5 w-3.5 text-blue-500' /> {doctor.experience}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Hospital and Language Info */}
                <div className='mt-4 pt-3 border-t border-gray-100 text-xs text-gray-600 space-y-1.5'>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-500'>Affiliation:</span>
                    <span className='font-medium text-gray-800 truncate max-w-[190px]'>{doctor.hospital}</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-gray-500'>Languages:</span>
                    <span className='font-medium text-gray-800'>{doctor.languages.join(', ')}</span>
                  </div>
                </div>

                {/* Tags */}
                <div className='mt-3 flex flex-wrap gap-1.5'>
                  {doctor.tags.map(tag => (
                    <span
                      key={tag}
                      className='inline-block px-2 py-0.5 text-[11px] font-medium bg-slate-100 text-slate-700 rounded-md'
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer & Action */}
              <div className='mt-6 pt-4 border-t border-gray-100 flex items-center justify-between'>
                <div>
                  <div className='text-xs text-gray-500'>Consultation Fee</div>
                  <div className='text-lg font-bold text-gray-900'>
                    ₹{doctor.consultationFee}{' '}
                    <span className='text-xs font-normal text-emerald-600'>/ session</span>
                  </div>
                </div>

                <div className='flex items-center gap-2'>
                  <Button asChild size='sm' className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm'>
                    <Link href='/patient' className='flex items-center gap-1.5'>
                      <Video className='h-3.5 w-3.5' /> Consult Now
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className='mt-12 rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 p-6 sm:p-8 text-white shadow-xl shadow-blue-500/10 flex flex-col sm:flex-row items-center justify-between gap-6'>
          <div className='space-y-1 text-center sm:text-left'>
            <div className='text-lg font-bold'>Are you a certified doctor or healthcare provider?</div>
            <p className='text-sm text-blue-100'>Join Care Portal’s national network to consult patients online and expand your clinical practice.</p>
          </div>
          <Button asChild size='lg' className='bg-white text-blue-700 hover:bg-blue-50 font-semibold shrink-0 shadow-md'>
            <Link href='/doctor'>Join as Doctor</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
