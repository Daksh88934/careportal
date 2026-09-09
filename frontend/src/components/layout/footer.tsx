import { Heart, Mail, Phone, MapPin } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className='bg-gray-900' aria-labelledby='footer-heading'>
      <h2 id='footer-heading' className='sr-only'>
        Footer
      </h2>
      <div className='mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32'>
        <div className='xl:grid xl:grid-cols-3 xl:gap-8'>
          <div className='space-y-8'>
            <div className='flex items-center space-x-2'>
              <Heart className='h-8 w-8 text-blue-400' />
              <span className='text-xl font-bold text-white'>Care Portal</span>
            </div>
            <p className='text-sm leading-6 text-gray-300'>
              Making quality healthcare accessible to everyone through
              innovative telemedicine solutions.
            </p>
            <div className='space-y-2'>
              <div className='flex items-center space-x-2 text-sm text-gray-300'>
                <Mail className='h-4 w-4' />
                <span>support@careportal.in</span>
              </div>
              <div className='flex items-center space-x-2 text-sm text-gray-300'>
                <Phone className='h-4 w-4' />
                <span>+91 1800-123-4567</span>
              </div>
              <div className='flex items-center space-x-2 text-sm text-gray-300'>
                <MapPin className='h-4 w-4' />
                <span>Mumbai, Maharashtra, India</span>
              </div>
            </div>
          </div>
          <div className='mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0'>
            <div className='md:grid md:grid-cols-2 md:gap-8'>
              <div>
                <h3 className='text-sm font-semibold leading-6 text-white'>
                  Platform
                </h3>
                <ul role='list' className='mt-6 space-y-4'>
                  <li>
                    <Link
                      href='/features'
                      className='text-sm leading-6 text-gray-300 hover:text-white'
                    >
                      Features
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/doctors'
                      className='text-sm leading-6 text-gray-300 hover:text-white'
                    >
                      Find Doctors
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/pharmacies'
                      className='text-sm leading-6 text-gray-300 hover:text-white'
                    >
                      Pharmacies
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/pricing'
                      className='text-sm leading-6 text-gray-300 hover:text-white'
                    >
                      Pricing
                    </Link>
                  </li>
                </ul>
              </div>
              <div className='mt-10 md:mt-0'>
                <h3 className='text-sm font-semibold leading-6 text-white'>
                  Support
                </h3>
                <ul role='list' className='mt-6 space-y-4'>
                  <li>
                    <Link
                      href='/help'
                      className='text-sm leading-6 text-gray-300 hover:text-white'
                    >
                      Help Center
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/contact'
                      className='text-sm leading-6 text-gray-300 hover:text-white'
                    >
                      Contact Us
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/faq'
                      className='text-sm leading-6 text-gray-300 hover:text-white'
                    >
                      FAQ
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/status'
                      className='text-sm leading-6 text-gray-300 hover:text-white'
                    >
                      System Status
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
            <div className='md:grid md:grid-cols-2 md:gap-8'>
              <div>
                <h3 className='text-sm font-semibold leading-6 text-white'>
                  Company
                </h3>
                <ul role='list' className='mt-6 space-y-4'>
                  <li>
                    <Link
                      href='/about'
                      className='text-sm leading-6 text-gray-300 hover:text-white'
                    >
                      About
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/careers'
                      className='text-sm leading-6 text-gray-300 hover:text-white'
                    >
                      Careers
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/blog'
                      className='text-sm leading-6 text-gray-300 hover:text-white'
                    >
                      Blog
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/press'
                      className='text-sm leading-6 text-gray-300 hover:text-white'
                    >
                      Press
                    </Link>
                  </li>
                </ul>
              </div>
              <div className='mt-10 md:mt-0'>
                <h3 className='text-sm font-semibold leading-6 text-white'>
                  Legal
                </h3>
                <ul role='list' className='mt-6 space-y-4'>
                  <li>
                    <Link
                      href='/privacy'
                      className='text-sm leading-6 text-gray-300 hover:text-white'
                    >
                      Privacy Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/terms'
                      className='text-sm leading-6 text-gray-300 hover:text-white'
                    >
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/cookies'
                      className='text-sm leading-6 text-gray-300 hover:text-white'
                    >
                      Cookie Policy
                    </Link>
                  </li>
                  <li>
                    <Link
                      href='/compliance'
                      className='text-sm leading-6 text-gray-300 hover:text-white'
                    >
                      Compliance
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className='mt-16 border-t border-gray-900/10 pt-8 sm:mt-20 lg:mt-24'>
          <p className='text-xs leading-5 text-gray-400'>
            &copy; 2025 Care Portal. All rights reserved. | Licensed under NMC
            Guidelines for Telemedicine Practice
          </p>
        </div>
      </div>
    </footer>
  );
}
