import Nav from '@/components/Nav/Nav'
import Hero from '@/components/Hero/Hero'
import About from '@/components/About/About'
import Services from '@/components/Services/Services'
import Process from '@/components/Process/Process'
import Gallery from '@/components/Gallery/Gallery'
import WhyVor from '@/components/WhyVor/WhyVor'
import Testimonials from '@/components/Testimonials/Testimonials'
import BookSection from '@/components/BookForm'
import Footer from '@/components/Footer/Footer'

export default function Home() {
  return (
    <>
      <Nav />
      <Hero />
      <About />
      <Services />
      <Process />
      <Gallery />
      <WhyVor />
      <Testimonials />
      <BookSection />
      <Footer />
    </>
  )
}
