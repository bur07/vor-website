import type { Metadata } from 'next'
import Nav from '@/components/Nav/Nav'
import Gallery from '@/components/Gallery/Gallery'
import Testimonials from '@/components/Testimonials/Testimonials'
import HomeCTA from '@/components/HomeCTA/HomeCTA'
import Footer from '@/components/Footer/Footer'

export const metadata: Metadata = {
  title: 'Window Cleaning Portfolio | Sydney Homes & Commercial',
  description:
    'Browse VØR Window Co.\'s portfolio of premium window cleaning work across Sydney and the ACT — from Northern Beaches waterfront estates to CBD commercial spaces.',
  openGraph: {
    title: 'Window Cleaning Portfolio | VØR Window Co. Sydney',
    description: 'See our work across Sydney\'s finest homes, from Northern Beaches waterfront estates to CBD commercial spaces.',
  },
}

export default function GalleryPage() {
  return (
    <>
      <Nav />
      <main style={{ paddingTop: '6rem' }}>
        <Gallery />
        <Testimonials />
        <HomeCTA />
      </main>
      <Footer />
    </>
  )
}
