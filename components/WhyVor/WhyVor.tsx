import RevealOnScroll from '@/components/shared/RevealOnScroll'
import styles from './WhyVor.module.css'

const cards = [
  {
    title: 'Guaranteed Results',
    desc: "Every visit comes with our VØR quality guarantee. If you're not completely satisfied, we return at no charge — no questions asked.",
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Always On Time',
    desc: 'Punctuality is part of the service. We respect your time and your property — arriving prepared and ready to deliver excellence, every time.',
    icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
  },
  {
    title: 'Eco-Conscious',
    desc: 'We use environmentally responsible solutions that are safe for your family, your home, and the Australian environment we all share.',
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
  },
  {
    title: 'Expert Team',
    desc: 'Every VØR specialist is trained to our exacting standard — professional, insured, and passionate about perfection on every property.',
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  },
  {
    title: 'Real Estate Ready',
    desc: "Partnering with top agents across Sydney and the ACT to ensure every open house dazzles — maximising your property's appeal and value.",
    icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
  },
  {
    title: 'Premium Experience',
    desc: 'From your first enquiry to the final walkthrough, every touchpoint is refined. This is elevated living — and it shows in every detail.',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
  },
]

export default function WhyVor() {
  return (
    <section id="why" className={styles.why}>
      <RevealOnScroll className={styles.header}>
        <div className={styles.sectionLabel}>Why VØR</div>
        <h2 className={styles.sectionTitle}>A Standard Like<br />No <em>Other.</em></h2>
        <div className={styles.divider} />
      </RevealOnScroll>

      <div className={styles.grid}>
        {cards.map((card, i) => (
          <RevealOnScroll key={card.title} delay={i * 85}>
            <div className={styles.card}>
              <div className={styles.icon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d={card.icon} />
                </svg>
              </div>
              <div className={styles.cardTitle}>{card.title}</div>
              <p className={styles.cardDesc}>{card.desc}</p>
            </div>
          </RevealOnScroll>
        ))}
      </div>
    </section>
  )
}
