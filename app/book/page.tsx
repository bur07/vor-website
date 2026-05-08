import type { Metadata } from 'next'
import Nav from '@/components/Nav/Nav'
import BookSection from '@/components/BookForm'
import Footer from '@/components/Footer/Footer'

export const metadata: Metadata = {
  title: 'Book a Window Cleaning Consultation | Same-Week Availability',
  description:
    'Book your premium window cleaning consultation online. VØR Window Co. serves all of Sydney and the ACT. Same-week availability. 100% satisfaction guaranteed. Call Noah on 0416 572 468.',
  openGraph: {
    title: 'Book a Window Cleaning Consultation | VØR Window Co.',
    description: 'Book online or call Noah directly on 0416 572 468. Same-week availability across Sydney and the ACT.',
  },
}

const bookingSchema = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Book a Consultation — VØR Window Co.',
  description: 'Request a window cleaning consultation for your Sydney or ACT property.',
  url: 'https://vorwindow.com.au/book',
}

export default function BookPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bookingSchema) }}
      />
      <Nav />
      <main style={{ paddingTop: '6rem' }}>
        <BookSection />
      </main>
      <Footer />
    </>
  )
}
