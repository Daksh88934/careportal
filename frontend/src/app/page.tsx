import { Hero } from '@/components/landing/hero';
import { Features } from '@/components/landing/features';
import { DoctorsShowcase } from '@/components/landing/doctors';
import { HowItWorks } from '@/components/landing/how-it-works';
import { Testimonials } from '@/components/landing/testimonials';
import { CTA } from '@/components/landing/cta';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <DoctorsShowcase />
      <Features />
      <HowItWorks />
      <Testimonials />
      <CTA />
      <Footer />
    </>
  );
}
