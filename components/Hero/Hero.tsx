import Link from 'next/link'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.heroBg} />
      <div className={styles.heroContent}>
        <div className={styles.heroEyebrow}>Sydney &amp; ACT — Premium Window Specialists</div>
        <h1 className={styles.heroHeadline}>
          Revealing<br /><em>Clarity.</em><br />Elevating<br />Views.
        </h1>
        <p className={styles.heroSub}>
          We don't just clean windows — we reveal a new level of purity and light. For those who take pride in their home, we bring what's unseen into reality — one pane at a time.
        </p>
        <div className={styles.heroBtns}>
          <Link href="/quote" className={styles.btnPrimary}>Get a Quote</Link>
          <a href="#about" className={styles.btnGhost}>Discover VØR</a>
        </div>
      </div>

      <div className={styles.heroBadge}>
        <div className={styles.heroBadgeRing}>
          <div className={styles.heroBadgeInner}>View<br />·<br />Pure<br />·<br />VØR</div>
        </div>
      </div>

      <div className={styles.heroScroll}>
        <span className={styles.scrollText}>Scroll</span>
        <div className={styles.scrollLine} />
      </div>
    </section>
  )
}
