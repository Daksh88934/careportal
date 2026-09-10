'use client';

import Image from 'next/image';
import { Star, Quote, CheckCircle2 } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Patient',
    location: 'Mumbai',
    content:
      'Care Portal made it effortless to consult with a top cardiologist from home. The video quality was crisp, and the e-prescription was dispatched to my nearest pharmacy in under 30 minutes!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    verified: true,
  },
  {
    name: 'Dr. Rajesh Kumar',
    role: 'General Physician & Diabetologist',
    location: 'Delhi NCR',
    content:
      'As a doctor managing hundreds of patients, Care Portal has streamlined my entire practice. The smart scheduling, digital prescription pad, and secure video calls are world-class.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200',
    verified: true,
  },
  {
    name: 'Amit Patel',
    role: 'Patient',
    location: 'Bengaluru',
    content:
      'The AI health assistant helped triage my symptoms before connecting me with an orthopedic specialist. Saved me hours in commute and waiting rooms. Outstanding service!',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    verified: true,
  },
];

export function Testimonials() {
  return (
    <section className='py-24 sm:py-32 bg-white relative overflow-hidden'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <div className='inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-3'>
            Patient & Doctor Stories
          </div>
          <h2 className='text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl'>
            Trusted by Thousands Across India
          </h2>
          <p className='mt-3 text-base text-gray-600'>
            See why doctors and patients choose Care Portal for trusted remote healthcare.
          </p>
        </div>

        <div className='mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none'>
          <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            {testimonials.map(testimonial => (
              <div
                key={testimonial.name}
                className='rounded-3xl bg-slate-50/80 p-8 text-sm leading-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between relative'
              >
                <div>
                  <div className='flex items-center justify-between'>
                    <div className='flex gap-x-1 text-amber-400'>
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className='h-4 w-4 fill-current' />
                      ))}
                    </div>
                    <Quote className='h-6 w-6 text-blue-200' />
                  </div>

                  <blockquote className='mt-5 text-gray-800 text-base leading-relaxed'>
                    "{testimonial.content}"
                  </blockquote>
                </div>

                <figcaption className='mt-6 pt-5 border-t border-slate-200/60 flex items-center gap-x-3.5'>
                  <div className='relative w-12 h-12 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-white shadow-sm'>
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      fill
                      className='object-cover'
                    />
                  </div>
                  <div>
                    <div className='font-bold text-gray-900 flex items-center gap-1'>
                      {testimonial.name}
                      {testimonial.verified && (
                        <CheckCircle2 className='h-3.5 w-3.5 text-blue-600' />
                      )}
                    </div>
                    <div className='text-xs text-gray-500'>
                      {testimonial.role} • {testimonial.location}
                    </div>
                  </div>
                </figcaption>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
