import RevealOnScroll from '@/components/shared/RevealOnScroll'
import styles from './Testimonials.module.css'

const testimonials = [
  {
    quote: "VØR brought a new light to our home. Every detail was impeccable — I wouldn't trust anyone else with our property.",
    name: 'Emma R.',
    role: 'Homeowner, Manly NSW',
    initials: 'ER',
  },
  {
    quote: 'Our real estate open house never looked better. VØR made all the difference — the light through those windows was extraordinary.',
    name: 'James L.',
    role: 'Principal Agent, Sydney',
    initials: 'JL',
  },
  {
    quote: 'The precision and professionalism of the VØR team is unmatched. Our commercial space in the CBD has never looked so pristine.',
    name: 'Sarah C.',
    role: 'Business Owner, Mosman NSW',
    initials: 'SC',
  },
]

export default function Testimonials() {
  return (
    <section id="testimonials" className={styles.testimonials}>
      <div className={styles.layout}>
        <RevealOnScroll className={styles.side}>
          <div className={styles.sectionLabel}>Testimonials</div>
          <h2 className={styles.sectionTitle}>
            Trusted by<br />Those Who<br /><em>Expect<br />the Best.</em>
          </h2>
          <div className={styles.divider} />
          <p>Our clients demand perfection — and so do we. Here is what they say about the VØR experience across Sydney and the ACT.</p>
        </RevealOnScroll>

        <RevealOnScroll delay={120} className={styles.list}>
          {testimonials.map(t => (
            <div key={t.initials} className={styles.item}>
              <div className={styles.stars}>
                {[...Array(5)].map((_, i) => <span key={i} className={styles.star}>★</span>)}
              </div>
              <span className={styles.quoteMark}>&ldquo;</span>
              <div className={styles.quote}>{t.quote}</div>
              <div className={styles.author}>
                <div className={styles.avatar}>{t.initials}</div>
                <div>
                  <div className={styles.authorName}>{t.name}</div>
                  <div className={styles.authorRole}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </RevealOnScroll>
      </div>
    </section>
  )
}
