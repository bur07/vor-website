import Link from 'next/link'
import RevealOnScroll from '@/components/shared/RevealOnScroll'
import styles from './Services.module.css'

const services = [
  {
    num: '01',
    slug: 'residential-small',
    name: 'Residential',
    desc: 'From intimate luxury apartments to expansive waterfront homes, we ensure every detail — frame, track, and sill — is pristine. The VØR standard, every visit.',
    price: '$299',
    unit: 'AUD — Small Home',
    featured: false,
    badge: null,
  },
  {
    num: '02',
    slug: 'residential-mid',
    name: 'Mid-Size Estate',
    desc: 'Our mid-tier offering covers larger homes with more complex window configurations, delivering the same meticulous care and precision throughout every pane.',
    price: '$399',
    unit: 'AUD — Mid Home',
    featured: true,
    badge: 'Most Popular',
  },
  {
    num: '03',
    slug: 'premium-estate',
    name: 'Premium Estate',
    desc: 'For those who demand the extraordinary — a bespoke, white-glove service for luxury estates, commercial spaces, and real estate open house events across Sydney & ACT.',
    price: '$599+',
    unit: 'AUD — Premium',
    featured: false,
    badge: null,
  },
]

export default function Services() {
  return (
    <section id="services" className={styles.services}>
      <div className={styles.intro}>
        <RevealOnScroll>
          <div className={styles.sectionLabel}>What We Offer</div>
          <h2 className={styles.sectionTitle}>Precision for<br /><em>Every View.</em></h2>
          <div className={styles.divider} />
        </RevealOnScroll>
        <RevealOnScroll delay={120}>
          <p>We offer premium window cleaning services tailored to discerning clients across Sydney and the ACT. Whether you&apos;re a homeowner with a waterfront masterpiece or a business preparing for an open house, we deliver unmatched quality — every detail, every time.</p>
        </RevealOnScroll>
      </div>

      <div className={styles.grid}>
        {services.map((s, i) => (
          <RevealOnScroll key={s.num} delay={i * 85}>
            <Link href={`/book?service=${s.slug}`} className={`${styles.card} ${s.featured ? styles.featured : ''}`}>
              {s.badge && <div className={styles.badge}>{s.badge}</div>}
              <div className={styles.num}>{s.num}</div>
              <div className={styles.name}>{s.name}</div>
              <p className={styles.desc}>{s.desc}</p>
              <div className={styles.price}>{s.price} <span>{s.unit}</span></div>
              <div className={styles.arrow}>→</div>
            </Link>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  )
}
