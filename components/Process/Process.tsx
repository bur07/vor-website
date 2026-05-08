import RevealOnScroll from '@/components/shared/RevealOnScroll'
import styles from './Process.module.css'

const steps = [
  {
    num: '01',
    title: 'Consultation',
    desc: 'We discuss your property, your expectations, and craft a tailored service plan that fits your vision perfectly.',
  },
  {
    num: '02',
    title: 'Preparation',
    desc: 'Our specialists arrive on time, fully equipped with professional-grade tools and eco-conscious solutions.',
  },
  {
    num: '03',
    title: 'Precision Clean',
    desc: 'Every pane, frame, track, and sill cleaned to an exacting standard. Not a streak, not a smudge, not a trace.',
  },
  {
    num: '04',
    title: 'Final Review',
    desc: 'A thorough walkthrough with you ensures every result meets the VØR promise — and your complete satisfaction.',
  },
]

export default function Process() {
  return (
    <section id="process" className={styles.process}>
      <RevealOnScroll>
        <div className={styles.sectionLabel}>How We Work</div>
        <h2 className={styles.sectionTitle}>The VØR <em>Standard.</em></h2>
        <div className={styles.divider} />
      </RevealOnScroll>

      <div className={styles.steps}>
        {steps.map((s, i) => (
          <RevealOnScroll key={s.num} delay={i * 85} className={styles.step}>
            <div className={styles.stepNumLine}>
              <div className={styles.stepNumCircle}>{s.num}</div>
              {i < steps.length - 1 && <div className={styles.stepNumTrack} />}
            </div>
            <div className={styles.stepTitle}>{s.title}</div>
            <p className={styles.stepDesc}>{s.desc}</p>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  )
}
