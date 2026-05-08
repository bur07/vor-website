import Link from 'next/link'
import styles from './HomeCTA.module.css'

export default function HomeCTA() {
  return (
    <section className={styles.cta}>
      <div className={styles.inner}>
        <div className={styles.label}>Ready When You Are</div>
        <h2 className={styles.title}>
          Sydney's Most Trusted<br /><em>Window Specialists.</em>
        </h2>
        <p className={styles.sub}>
          Same-week availability. 100% satisfaction guaranteed. Book today and experience the VØR standard for yourself.
        </p>
        <div className={styles.actions}>
          <Link href="/book" className={styles.btnPrimary}>Book Your Free Consultation</Link>
          <a href="tel:+61416572468" className={styles.btnGhost}>Call Noah — 0416 572 468</a>
        </div>
        <div className={styles.trust}>
          <span>★★★★★ 5.0 Google Rating</span>
          <span className={styles.dot}>·</span>
          <span>500+ Happy Clients</span>
          <span className={styles.dot}>·</span>
          <span>Fully Insured</span>
        </div>
      </div>
    </section>
  )
}
