import type { Metadata } from 'next'
import QuoteForm from '@/components/QuoteForm/QuoteForm'

export const metadata: Metadata = {
  title: 'Request a Quote — VØR Window Co.',
  description: 'Get a personalised quote for premium window cleaning in Sydney & ACT. We\'ll respond within 24 hours.',
}

export default function QuotePage() {
  return (
    <main style={{
      minHeight: '100vh',
      background: 'var(--blue-deep)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '6rem 1.5rem 4rem',
    }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem', maxWidth: '700px', width: '100%' }}>
        <div style={{
          fontFamily: "var(--font-jost),'Jost',sans-serif",
          fontSize: '0.6rem',
          letterSpacing: '0.28em',
          textTransform: 'uppercase',
          color: 'var(--blue-baby)',
          marginBottom: '1rem',
        }}>
          Step 1 of 2
        </div>
        <h1 style={{
          fontFamily: "var(--font-cormorant),'Cormorant Garamond',serif",
          fontSize: 'clamp(2rem, 5vw, 2.8rem)',
          fontWeight: 300,
          color: 'var(--cream)',
          margin: '0 0 0.8rem',
          letterSpacing: '0.04em',
        }}>
          Request a Quote
        </h1>
        <p style={{
          fontFamily: "var(--font-jost),'Jost',sans-serif",
          fontSize: '0.88rem',
          color: 'rgba(250,246,238,0.5)',
          lineHeight: 1.8,
          margin: 0,
        }}>
          Fill in your details and we&apos;ll send a personalised quote within 24 hours.
          You&apos;ll receive a reference code to complete your booking once your quote is ready.
        </p>
      </div>
      <QuoteForm />
    </main>
  )
}
