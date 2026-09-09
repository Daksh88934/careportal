import { UserPlus, Calendar, Video, FileText } from 'lucide-react';

const steps = [
  {
    name: 'Sign Up',
    description:
      'Create your account and complete your medical profile in minutes.',
    icon: UserPlus,
    step: '01',
  },
  {
    name: 'Book Appointment',
    description:
      'Choose from available doctors and book your preferred time slot.',
    icon: Calendar,
    step: '02',
  },
  {
    name: 'Video Consultation',
    description:
      'Connect with your doctor through secure video call for consultation.',
    icon: Video,
    step: '03',
  },
  {
    name: 'Get Prescription',
    description: 'Receive digital prescription and order medicines if needed.',
    icon: FileText,
    step: '04',
  },
];

export function HowItWorks() {
  return (
    <section className='bg-gray-50 py-24 sm:py-32'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl lg:text-center'>
          <h2 className='text-base font-semibold leading-7 text-blue-600'>
            Simple Process
          </h2>
          <p className='mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
            How it works
          </p>
          <p className='mt-6 text-lg leading-8 text-gray-600'>
            Get started with healthcare consultations in just four simple steps.
          </p>
        </div>
        <div className='mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none'>
          <dl className='grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4'>
            {steps.map((step, index) => (
              <div
                key={step.name}
                className='flex flex-col items-center text-center'
              >
                <div className='relative'>
                  <div className='flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white'>
                    <step.icon className='h-8 w-8' aria-hidden='true' />
                  </div>
                  <div className='absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600'>
                    {step.step}
                  </div>
                  {index < steps.length - 1 && (
                    <div className='absolute top-8 left-16 hidden h-0.5 w-16 bg-gray-300 lg:block' />
                  )}
                </div>
                <dt className='mt-6 text-base font-semibold leading-7 text-gray-900'>
                  {step.name}
                </dt>
                <dd className='mt-2 text-base leading-7 text-gray-600'>
                  {step.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
