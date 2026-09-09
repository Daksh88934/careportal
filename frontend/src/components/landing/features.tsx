import {
  Video,
  FileText,
  ShoppingCart,
  Bot,
  Shield,
  Clock,
} from 'lucide-react';

const features = [
  {
    name: 'Video Consultations',
    description:
      'High-quality video calls with certified doctors from the comfort of your home.',
    icon: Video,
  },
  {
    name: 'E-Prescriptions',
    description:
      'Digital prescriptions with QR codes for easy verification and medicine ordering.',
    icon: FileText,
  },
  {
    name: 'Medicine Ordering',
    description:
      'Order prescribed medicines online with doorstep delivery from verified pharmacies.',
    icon: ShoppingCart,
  },
  {
    name: 'AI Health Assistant',
    description:
      'Get instant health advice and symptom analysis from our AI-powered chatbot.',
    icon: Bot,
  },
  {
    name: 'Secure & Private',
    description:
      'End-to-end encryption ensures your medical data remains completely private.',
    icon: Shield,
  },
  {
    name: '24/7 Availability',
    description:
      'Access healthcare services anytime, anywhere with our round-the-clock platform.',
    icon: Clock,
  },
];

export function Features() {
  return (
    <section className='py-24 sm:py-32'>
      <div className='mx-auto max-w-7xl px-6 lg:px-8'>
        <div className='mx-auto max-w-2xl lg:text-center'>
          <h2 className='text-base font-semibold leading-7 text-blue-600'>
            Complete Healthcare Solution
          </h2>
          <p className='mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl'>
            Everything you need for modern healthcare
          </p>
          <p className='mt-6 text-lg leading-8 text-gray-600'>
            Our comprehensive telemedicine platform brings together all
            essential healthcare services in one secure, easy-to-use
            application.
          </p>
        </div>
        <div className='mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl'>
          <dl className='grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16'>
            {features.map(feature => (
              <div key={feature.name} className='relative pl-16'>
                <dt className='text-base font-semibold leading-7 text-gray-900'>
                  <div className='absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600'>
                    <feature.icon
                      className='h-6 w-6 text-white'
                      aria-hidden='true'
                    />
                  </div>
                  {feature.name}
                </dt>
                <dd className='mt-2 text-base leading-7 text-gray-600'>
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
