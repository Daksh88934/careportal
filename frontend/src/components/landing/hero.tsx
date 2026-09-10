'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Shield, Clock, Users, Star, Video, CheckCircle2, HeartPulse, Activity } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export function Hero() {
  return (
    <section className='relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50/50 py-16 sm:py-24 lg:py-28'>
      {/* Background ambient accents */}
      <div className='absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-blue-200/30 to-indigo-200/20 blur-3xl -z-10 pointer-events-none' />

      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center'>
          
          {/* Left Hero Content */}
          <div className='lg:col-span-7 text-center lg:text-left'>
            {/* Top Badge */}
            <div className='inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/90 text-blue-700 text-xs font-semibold mb-6 shadow-sm'>
              <HeartPulse className='h-4 w-4 text-blue-600 animate-pulse' />
              <span>Next-Gen Telemedicine & Health Portal</span>
            </div>

            <h1 className='text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl leading-[1.15]'>
              Quality Healthcare at Your{' '}
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600'>
                Fingertips
              </span>
            </h1>

            <p className='mt-6 text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0'>
              Connect in minutes with India’s top certified doctors. Instant HD video consultations, digital e-prescriptions delivered to doorstep pharmacies, and AI health triage assistance 24/7.
            </p>

            {/* CTAs */}
            <div className='mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4'>
              <Button asChild size='lg' className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-500/25 px-7 text-base font-semibold'>
                <Link href='/patient'>
                  Book Consultation <ArrowRight className='ml-2 h-4 w-4' />
                </Link>
              </Button>

              <Button asChild variant='outline' size='lg' className='rounded-xl border-gray-300 hover:bg-gray-50 text-base font-semibold'>
                <Link href='/consultation'>
                  <Video className='mr-2 h-4 w-4 text-blue-600' /> Live Video Room
                </Link>
              </Button>
            </div>

            {/* Trust Avatars */}
            <div className='mt-10 flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4 border-t border-gray-100'>
              <div className='flex -space-x-2.5 overflow-hidden'>
                <Image
                  className='inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover'
                  src='https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=120'
                  alt='Doctor 1'
                  width={40}
                  height={40}
                />
                <Image
                  className='inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover'
                  src='https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=120'
                  alt='Doctor 2'
                  width={40}
                  height={40}
                />
                <Image
                  className='inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover'
                  src='https://images.unsplash.com/photo-1594824813511-209252328701?auto=format&fit=crop&q=80&w=120'
                  alt='Doctor 3'
                  width={40}
                  height={40}
                />
                <Image
                  className='inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover'
                  src='https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=120'
                  alt='Doctor 4'
                  width={40}
                  height={40}
                />
              </div>

              <div className='text-left'>
                <div className='flex items-center gap-1 text-amber-500'>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className='h-4 w-4 fill-current' />
                  ))}
                  <span className='ml-1 text-sm font-bold text-gray-900'>4.9/5</span>
                </div>
                <div className='text-xs text-gray-500'>From 15,000+ verified patient reviews</div>
              </div>
            </div>
          </div>

          {/* Right Hero Visual: Doctor Consultation Interactive Card */}
          <div className='lg:col-span-5 relative max-w-md mx-auto w-full'>
            <div className='relative rounded-3xl bg-white p-6 shadow-2xl border border-blue-100/80'>
              
              {/* Doctor Header card */}
              <div className='flex items-center gap-4'>
                <div className='relative w-16 h-16 rounded-2xl overflow-hidden bg-blue-100 shrink-0 border border-blue-200'>
                  <Image
                    src='https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'
                    alt='Dr. Ananya Sharma'
                    fill
                    className='object-cover'
                  />
                  <span className='absolute bottom-1 right-1 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full' />
                </div>
                <div>
                  <div className='flex items-center gap-1'>
                    <h3 className='font-bold text-gray-900'>Dr. Ananya Sharma</h3>
                    <CheckCircle2 className='h-4 w-4 text-blue-600' />
                  </div>
                  <p className='text-xs text-blue-600 font-medium'>Senior Cardiologist (MD, DM)</p>
                  <div className='flex items-center gap-2 mt-1 text-xs text-gray-500'>
                    <span className='flex items-center gap-0.5 text-amber-500 font-semibold'>
                      <Star className='h-3 w-3 fill-current' /> 4.9
                    </span>
                    <span>•</span>
                    <span>14+ Yrs Exp</span>
                  </div>
                </div>
              </div>

              {/* Live Consultation preview panel */}
              <div className='mt-5 rounded-2xl bg-slate-900 text-white p-4 relative overflow-hidden shadow-inner'>
                <div className='flex items-center justify-between text-xs pb-3 border-b border-slate-800'>
                  <span className='inline-flex items-center gap-1.5 text-emerald-400 font-medium'>
                    <span className='w-2 h-2 rounded-full bg-emerald-400 animate-ping' /> HD Video Session
                  </span>
                  <span className='text-slate-400 font-mono'>00:14:32</span>
                </div>

                <div className='relative mt-3 h-36 rounded-xl overflow-hidden bg-slate-800'>
                  <Image
                    src='https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=600'
                    alt='Consultation Stream'
                    fill
                    className='object-cover opacity-90'
                  />
                  <div className='absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded text-[11px] font-medium text-white'>
                    Dr. Rajesh Verma • Neurologist
                  </div>
                  <div className='absolute top-2 right-2 bg-emerald-500/90 text-white text-[10px] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1'>
                    <Activity className='h-3 w-3' /> Encrypted
                  </div>
                </div>

                <div className='mt-3 flex items-center justify-between'>
                  <div className='text-xs'>
                    <div className='text-slate-400'>E-Prescription</div>
                    <div className='text-emerald-400 font-medium'>Generated & Signed</div>
                  </div>
                  <Button asChild size='sm' className='bg-blue-600 hover:bg-blue-500 text-xs font-semibold h-8 rounded-lg'>
                    <Link href='/patient'>Join Room</Link>
                  </Button>
                </div>
              </div>

              {/* Quick perks */}
              <div className='mt-4 grid grid-cols-2 gap-3 text-xs text-gray-600'>
                <div className='flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/60 border border-blue-100/50'>
                  <Clock className='h-4 w-4 text-blue-600 shrink-0' />
                  <span>2 Min Instant Connect</span>
                </div>
                <div className='flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100/50'>
                  <Shield className='h-4 w-4 text-emerald-600 shrink-0' />
                  <span>100% HIPAA & NMC Compliant</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Stats Grid */}
        <div className='mt-16 sm:mt-20 pt-10 border-t border-gray-200/80'>
          <dl className='grid grid-cols-2 lg:grid-cols-4 gap-6 text-center'>
            <div className='p-4 rounded-2xl bg-white border border-gray-100 shadow-sm'>
              <dt className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>Verified Doctors</dt>
              <dd className='mt-1 text-3xl font-extrabold text-blue-600'>500+</dd>
              <p className='text-xs text-gray-500 mt-1'>Across 25+ Specialties</p>
            </div>
            <div className='p-4 rounded-2xl bg-white border border-gray-100 shadow-sm'>
              <dt className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>Patients Served</dt>
              <dd className='mt-1 text-3xl font-extrabold text-gray-900'>50,000+</dd>
              <p className='text-xs text-gray-500 mt-1'>Across all Indian states</p>
            </div>
            <div className='p-4 rounded-2xl bg-white border border-gray-100 shadow-sm'>
              <dt className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>Avg Connect Time</dt>
              <dd className='mt-1 text-3xl font-extrabold text-emerald-600'>&lt; 2 Mins</dd>
              <p className='text-xs text-gray-500 mt-1'>Instant online queues</p>
            </div>
            <div className='p-4 rounded-2xl bg-white border border-gray-100 shadow-sm'>
              <dt className='text-xs font-semibold text-gray-500 uppercase tracking-wider'>Partner Pharmacies</dt>
              <dd className='mt-1 text-3xl font-extrabold text-indigo-600'>1,200+</dd>
              <p className='text-xs text-gray-500 mt-1'>Fast medicine dispatch</p>
            </div>
          </dl>
        </div>

      </div>
    </section>
  );
}
