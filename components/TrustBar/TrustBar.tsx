import styles from './TrustBar.module.css'

const signals = [
  { icon: '★', label: '5.0 Google Rating' },
  { icon: '✓', label: '500+ Projects Completed' },
  { icon: '◈', label: '100% Satisfaction Guarantee' },
  { icon: '◷', label: 'Same-Week Availability' },
  { icon: '⌂', label: 'Sydney & ACT Wide' },
]

export default function TrustBar() {
  return (
    <div className={styles.bar}>
      {signals.map((s, i) => (
        <div key={i} className={styles.item}>
          <span className={styles.icon}>{s.icon}</span>
          <span className={styles.label}>{s.label}</span>
          {i < signals.length - 1 && <span className={styles.sep} aria-hidden />}
        </div>
      ))}
    </div>
  )
}
