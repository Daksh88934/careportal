import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Priya Sharma',
    role: 'Patient',
    location: 'Mumbai',
    content:
      'Care Portal made it so easy to consult with a doctor during the pandemic. The video quality was excellent and the prescription was delivered to my doorstep.',
    rating: 5,
    avatar: '/avatars/priya.jpg',
  },
  {
    name: 'Dr. Rajesh Kumar',
    role: 'General Physician',
    location: 'Delhi',
    content:
      'As a doctor, I love how Care Portal streamlines patient consultations. The platform is intuitive and helps me manage my practice efficiently.',
    rating: 5,
    avatar: '/avatars/rajesh.jpg',
  },
  {
    name: 'Amit Patel',
    role: 'Patient',
    location: 'Bangalore',
    content:
      'The AI health assistant helped me understand my symptoms before consulting with a doctor. Very helpful and saved me time.',
    rating: 5,
    avatar: '/avatars/amit.jpg',
  },
];

export function Testimonials() {
  return (
    <section className='py-24 sm:py-32'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-xl text-center'>
          <h2 className='text-lg font-semibold leading-8 tracking-tight text-blue-600'>
            Testimonials
          </h2>
          <p className='mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
            What our users say
          </p>
        </div>
        <div className='mx-auto mt-16 flow-root max-w-2xl sm:mt-20 lg:mx-0 lg:max-w-none'>
          <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3'>
            {testimonials.map(testimonial => (
              <div
                key={testimonial.name}
                className='rounded-2xl bg-gray-50 p-8 text-sm leading-6'
              >
                <div className='flex gap-x-1 text-yellow-400'>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className='h-5 w-5 fill-current' />
                  ))}
                </div>
                <blockquote className='mt-6 text-gray-900'>
                  <p>"{testimonial.content}"</p>
                </blockquote>
                <figcaption className='mt-6 flex items-center gap-x-4'>
                  <div className='h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center'>
                    <span className='text-sm font-semibold text-gray-700'>
                      {testimonial.name
                        .split(' ')
                        .map(n => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div>
                    <div className='font-semibold text-gray-900'>
                      {testimonial.name}
                    </div>
                    <div className='text-gray-600'>
                      {testimonial.role}, {testimonial.location}
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
