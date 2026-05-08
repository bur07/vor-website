import Image from 'next/image'
import RevealOnScroll from '@/components/shared/RevealOnScroll'
import styles from './About.module.css'

export default function About() {
  return (
    <section id="about" className={styles.about}>
      <RevealOnScroll className={styles.imgWrap}>
        <div className={styles.aboutImg}>
          <Image
            src="https://images.unsplash.com/photo-1482449609509-eae2a7ea42b7?w=900&q=80"
            alt="VØR Window Co. premium service"
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width:900px) 100vw, 50vw"
          />
          <div className={styles.aboutImgFrame} />
          <div className={styles.aboutImgCaption}>Northern Beaches · Sydney · ACT</div>
        </div>
      </RevealOnScroll>

      <RevealOnScroll delay={120} className={styles.aboutText}>
        <div className={styles.sectionLabel}>Our Vision</div>
        <h2 className={styles.sectionTitle}>
          Clarity. Precision.<br /><em>Elevation.</em>
        </h2>
        <div className={styles.divider} />
        <p>At VØR Window Co., we are driven by a singular passion: to elevate the everyday. We serve those who are obsessed with their homes — who see every detail as part of their success story.</p>
        <p>Born on the Northern Beaches, we began with a commitment to precision. Today, we partner with leading real estate firms across Sydney and the ACT, scaling our team of experts as we bring VØR's unmatched standards from Australia to the world.</p>
        <div className={styles.philosophy}>
          <p>"VØR stands for View and Pure — a belief that clarity is a form of luxury. Every window we clean is a promise kept. A vision brought to life."</p>
        </div>
        <div className={styles.statRow}>
          <div className={styles.stat}>
            <div className={styles.statNum}>500+</div>
            <div className={styles.statLbl}>Projects Completed</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum}>100%</div>
            <div className={styles.statLbl}>Satisfaction Rate</div>
          </div>
          <div className={styles.stat}>
            <div className={styles.statNum} style={{ fontSize: '1.6rem', lineHeight: 1.3 }}>Sydney<br />&amp; ACT</div>
            <div className={styles.statLbl}>Service Area</div>
          </div>
        </div>
      </RevealOnScroll>
    </section>
  )
}
