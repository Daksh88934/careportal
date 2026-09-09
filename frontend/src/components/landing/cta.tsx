import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function CTA() {
  return (
    <section className='bg-blue-600'>
      <div className='px-6 py-24 sm:px-6 sm:py-32 lg:px-8'>
        <div className='mx-auto max-w-2xl text-center'>
          <h2 className='text-3xl font-bold tracking-tight text-white sm:text-4xl'>
            Ready to transform your healthcare experience?
          </h2>
          <p className='mx-auto mt-6 max-w-xl text-lg leading-8 text-blue-100'>
            Join thousands of patients and doctors who trust Care Portal for their
            healthcare needs. Start your journey to better health today.
          </p>
          <div className='mt-10 flex items-center justify-center gap-x-6'>
            <Button asChild size='lg' variant='secondary'>
              <Link href='/auth/signup'>
                Get Started Now <ArrowRight className='ml-2 h-4 w-4' />
              </Link>
            </Button>
            <Button
              asChild
              variant='ghost'
              size='lg'
              className='text-white hover:text-blue-600'
            >
              <Link href='/auth/login'>Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
