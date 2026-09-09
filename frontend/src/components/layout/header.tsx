'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Heart } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className='bg-white shadow-sm'>
      <nav
        className='mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8'
        aria-label='Global'
      >
        <div className='flex lg:flex-1'>
          <Link href='/' className='-m-1.5 p-1.5 flex items-center space-x-2'>
            <Heart className='h-8 w-8 text-blue-600' />
            <span className='text-xl font-bold text-gray-900'>Care Portal</span>
          </Link>
        </div>
        <div className='flex lg:hidden'>
          <button
            type='button'
            className='-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700'
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className='sr-only'>Open main menu</span>
            <Menu className='h-6 w-6' aria-hidden='true' />
          </button>
        </div>
        <div className='hidden lg:flex lg:gap-x-12'>
          <Link
            href='#features'
            className='text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600'
          >
            Features
          </Link>
          <Link
            href='#how-it-works'
            className='text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600'
          >
            How it Works
          </Link>
          <Link
            href='#testimonials'
            className='text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600'
          >
            Testimonials
          </Link>
          <Link
            href='/about'
            className='text-sm font-semibold leading-6 text-gray-900 hover:text-blue-600'
          >
            About
          </Link>
        </div>
        <div className='hidden lg:flex lg:flex-1 lg:justify-end lg:gap-x-4'>
          <Button asChild variant='ghost'>
            <Link href='/auth/login'>Sign In</Link>
          </Button>
          <Button asChild>
            <Link href='/auth/signup'>Get Started</Link>
          </Button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className='lg:hidden' role='dialog' aria-modal='true'>
          <div className='fixed inset-0 z-10'></div>
          <div className='fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10'>
            <div className='flex items-center justify-between'>
              <Link
                href='/'
                className='-m-1.5 p-1.5 flex items-center space-x-2'
              >
                <Heart className='h-8 w-8 text-blue-600' />
                <span className='text-xl font-bold text-gray-900'>Care Portal</span>
              </Link>
              <button
                type='button'
                className='-m-2.5 rounded-md p-2.5 text-gray-700'
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className='sr-only'>Close menu</span>
                <X className='h-6 w-6' aria-hidden='true' />
              </button>
            </div>
            <div className='mt-6 flow-root'>
              <div className='-my-6 divide-y divide-gray-500/10'>
                <div className='space-y-2 py-6'>
                  <Link
                    href='#features'
                    className='-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50'
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Features
                  </Link>
                  <Link
                    href='#how-it-works'
                    className='-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50'
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    How it Works
                  </Link>
                  <Link
                    href='#testimonials'
                    className='-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50'
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Testimonials
                  </Link>
                  <Link
                    href='/about'
                    className='-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-900 hover:bg-gray-50'
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    About
                  </Link>
                </div>
                <div className='py-6 space-y-2'>
                  <Button
                    asChild
                    variant='ghost'
                    className='w-full justify-start'
                  >
                    <Link
                      href='/auth/login'
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                  </Button>
                  <Button asChild className='w-full'>
                    <Link
                      href='/auth/signup'
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Started
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
