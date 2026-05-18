import Stripe from 'stripe'
import { redirect } from 'next/navigation'
import Nav from '@/components/Nav/Nav'
import Footer from '@/components/Footer/Footer'
import styles from './success.module.css'

async function getSession(sessionId: string) {
  if (!process.env.STRIPE_SECRET_KEY) return null
  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    return await stripe.checkout.sessions.retrieve(sessionId)
  } catch {
    return null
  }
}

export default async function BookingSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  const { session_id } = await searchParams
  if (!session_id) redirect('/booking')

  const session = await getSession(session_id)
  if (!session || session.payment_status !== 'paid') redirect('/booking')

  const m = session.metadata!

  return (
    <>
      <Nav />
      <main className={styles.main}>
        <div className={styles.card}>
          <div className={styles.icon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
              <polyline points="22,4 12,14.01 9,11.01"/>
            </svg>
          </div>

          <div className={styles.title}>Booking Confirmed</div>
          <p className={styles.sub}>
            Payment received. A confirmation has been sent to <strong>{m.email}</strong>.
            Noah will be in touch to finalise your appointment time.
          </p>

          <div className={styles.refBadge}>
            <div className={styles.refLabel}>Booking Reference</div>
            <div className={styles.refCode}>{m.refCode}</div>
          </div>

          <div className={styles.table}>
            <div className={styles.row}><span>Service</span><strong>{m.tier}</strong></div>
            <div className={styles.row}><span>Appointment</span><strong>{m.date} · {m.time}</strong></div>
            <div className={styles.row}><span>Payment</span><strong>{m.paymentType}</strong></div>
            <div className={styles.row}><span>Amount Paid</span><strong>${m.amountPaid} AUD</strong></div>
            {Number(m.balanceDue) > 0 && (
              <div className={styles.row}><span>Balance on Day</span><strong>${m.balanceDue} AUD</strong></div>
            )}
          </div>

          <p className={styles.contact}>
            Questions? Call Noah on{' '}
            <a href="tel:+61416572468">0416 572 468</a>
            {' '}or email{' '}
            <a href="mailto:info@vorwindowco.com">info@vorwindowco.com</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  )
}
