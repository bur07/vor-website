import BookFormClient from './BookFormClient'
import styles from './BookForm.module.css'

export default function BookSection() {
  return (
    <section className={styles.section}>
      <div className={styles.pageHeader}>
        <div className={styles.pageLabel}>Book a Consultation</div>
        <h1 className={styles.pageTitle}>
          Let&apos;s Bring Your<br />Vision <em>to Life.</em>
        </h1>
        <p className={styles.pageSub}>
          Fill in the details below and Noah will be in touch within 24 hours to confirm your consultation. Same-week availability across Sydney and the ACT.
        </p>
      </div>
      <div className={styles.container}>
        <BookFormClient />
      </div>
    </section>
  )
}
