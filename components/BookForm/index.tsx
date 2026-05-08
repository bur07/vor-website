import RevealOnScroll from '@/components/shared/RevealOnScroll'
import BookFormClient from './BookFormClient'
import styles from './BookForm.module.css'

export default function BookSection() {
  return (
    <section id="book" className={styles.section}>
      <RevealOnScroll className={styles.info}>
        <div className={styles.sectionLabel}>Book a Consultation</div>
        <h2 className={styles.sectionTitle}>
          Let's Bring<br />Your Vision<br /><em>to Life.</em>
        </h2>
        <div className={styles.divider} />
        <p>Ready to elevate your view? Booking with VØR is seamless. Fill in the form and Noah will be in touch within 24 hours to confirm your consultation.</p>

        <div className={styles.contactDetail}>
          <div className={styles.contactItem}>
            <div className={styles.contactIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <div className={styles.contactText}>
              <strong>Call or Text Noah</strong>
              0416 572 468
            </div>
          </div>
          <div className={styles.contactItem}>
            <div className={styles.contactIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className={styles.contactText}>
              <strong>Email</strong>
              hello@vorwindow.com.au
            </div>
          </div>
          <div className={styles.contactItem}>
            <div className={styles.contactIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className={styles.contactText}>
              <strong>Service Area</strong>
              All of Sydney &amp; ACT
            </div>
          </div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll delay={120}>
        <BookFormClient />
      </RevealOnScroll>
    </section>
  )
}
