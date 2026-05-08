import type { Metadata } from 'next'
import Nav from '@/components/Nav/Nav'
import About from '@/components/About/About'
import WhyVor from '@/components/WhyVor/WhyVor'
import HomeCTA from '@/components/HomeCTA/HomeCTA'
import Footer from '@/components/Footer/Footer'

export const metadata: Metadata = {
  title: 'About Us | Northern Beaches Window Cleaning Experts',
  description:
    'Founded on the Northern Beaches of Sydney, VØR Window Co. brings unmatched precision to every clean. Learn about our story, our values, and the team behind Sydney\'s premium window cleaning service.',
  openGraph: {
    title: 'About VØR Window Co. | Northern Beaches Window Cleaning Experts',
    description: 'Our story, our values, and why 500+ Sydney homeowners trust us with their properties.',
  },
}

export default function AboutPage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: '6rem' }}>
        <About />
        <WhyVor />
        <HomeCTA />
      </main>
      <Footer />
    </>
  )
}
