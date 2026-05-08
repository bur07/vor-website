import type { Metadata } from 'next'
import Nav from '@/components/Nav/Nav'
import Services from '@/components/Services/Services'
import Process from '@/components/Process/Process'
import FAQ from '@/components/FAQ/FAQ'
import HomeCTA from '@/components/HomeCTA/HomeCTA'
import Footer from '@/components/Footer/Footer'

export const metadata: Metadata = {
  title: 'Window Cleaning Services & Pricing | Sydney & ACT',
  description:
    'Premium window cleaning packages from $299 AUD. Residential, mid-size estate, and luxury premium services for homes and businesses across Sydney and the ACT. Same-week availability.',
  openGraph: {
    title: 'Window Cleaning Services & Pricing | VØR Window Co. Sydney',
    description: 'Premium window cleaning packages from $299. Residential, estate, and commercial services across Sydney and the ACT.',
  },
}

const serviceFaq = {
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: 'Premium Window Cleaning',
  provider: { '@type': 'LocalBusiness', name: 'VØR Window Co.' },
  areaServed: ['Sydney', 'Australian Capital Territory'],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Window Cleaning Packages',
    itemListElement: [
      { '@type': 'Offer', name: 'Residential Small Home', price: '299', priceCurrency: 'AUD', description: 'Full window clean including frames, tracks, and sills for smaller homes.' },
      { '@type': 'Offer', name: 'Mid-Size Estate', price: '399', priceCurrency: 'AUD', description: 'Complete window cleaning for mid-size homes with more complex configurations.' },
      { '@type': 'Offer', name: 'Premium Estate', price: '599', priceCurrency: 'AUD', description: 'White-glove window cleaning for luxury estates, commercial spaces, and open homes.' },
    ],
  },
}

export default function ServicesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceFaq) }}
      />
      <Nav />
      <main style={{ paddingTop: '6rem' }}>
        <Services />
        <Process />
        <FAQ />
        <HomeCTA />
      </main>
      <Footer />
    </>
  )
}
