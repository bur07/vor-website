import Nav from '@/components/Nav/Nav'
import Hero from '@/components/Hero/Hero'
import TrustBar from '@/components/TrustBar/TrustBar'
import About from '@/components/About/About'
import Services from '@/components/Services/Services'
import Process from '@/components/Process/Process'
import Gallery from '@/components/Gallery/Gallery'
import WhyVor from '@/components/WhyVor/WhyVor'
import Testimonials from '@/components/Testimonials/Testimonials'
import FAQ from '@/components/FAQ/FAQ'
import HomeCTA from '@/components/HomeCTA/HomeCTA'
import Footer from '@/components/Footer/Footer'

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <TrustBar />
      <About />
      <Services />
      <Process />
      <Gallery />
      <WhyVor />
      <Testimonials />
      <FAQ />
      <HomeCTA />
      <Footer />
    </>
  )
}
