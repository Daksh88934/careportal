'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Shield, Clock, Users } from 'lucide-react';
import Link from 'next/link';

export function Hero() {
  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-blue-50 py-20 sm:py-32'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <h1 className='text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl'>
            Quality Healthcare at Your{' '}
            <span className='text-blue-600'>Fingertips</span>
          </h1>
          <p className='mt-6 text-lg leading-8 text-gray-600'>
            Connect with certified doctors, book video consultations, get
            e-prescriptions, and order medicines online. Advanced telemedicine
            platform with AI health assistance.
          </p>
          <div className='mt-10 flex items-center justify-center gap-x-6'>
            <Button asChild size='lg' className='bg-blue-600 hover:bg-blue-700'>
              <Link href='/auth/signup'>
                Get Started <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
            <Button variant='outline' size='lg' className='group'>
              <Play className='mr-2 h-4 w-4 group-hover:scale-110 transition-transform' />
              Watch Demo
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className='mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl'>
          <dl className='grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-3 lg:gap-y-16'>
            <div className='relative pl-16'>
              <dt className='text-base font-semibold leading-7 text-gray-900'>
                <div className='absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600'>
                  <Users className='h-6 w-6 text-white' />
                </div>
                10,000+ Patients
              </dt>
              <dd className='mt-2 text-base leading-7 text-gray-600'>
                Trusted by thousands of patients across India
              </dd>
            </div>
            <div className='relative pl-16'>
              <dt className='text-base font-semibold leading-7 text-gray-900'>
                <div className='absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600'>
                  <Shield className='h-6 w-6 text-white' />
                </div>
                500+ Doctors
              </dt>
              <dd className='mt-2 text-base leading-7 text-gray-600'>
                Certified healthcare professionals available 24/7
              </dd>
            </div>
            <div className='relative pl-16'>
              <dt className='text-base font-semibold leading-7 text-gray-900'>
                <div className='absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600'>
                  <Clock className='h-6 w-6 text-white' />
                </div>
                2 Min Response
              </dt>
              <dd className='mt-2 text-base leading-7 text-gray-600'>
                Average response time for consultations
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
