'use client'

import { useState } from 'react'
import styles from './FAQ.module.css'

const faqs = [
  {
    q: 'What areas of Sydney do you service?',
    a: 'We service all of Sydney — from the Northern Beaches and Eastern Suburbs to the Inner West, North Shore, and the Hills District. We also cover the full Australian Capital Territory including Canberra.',
  },
  {
    q: 'How long does a standard window clean take?',
    a: 'A small home typically takes 1.5–2 hours. Mid-size estates run 2.5–3.5 hours. Larger premium estates are assessed individually. We always complete the job properly — we never rush.',
  },
  {
    q: 'Do I need to be home during the clean?',
    a: 'Not necessarily. Many clients provide access instructions and we complete the job independently. We will always confirm details with you beforehand and send a completion message when done.',
  },
  {
    q: 'Are your cleaners fully insured?',
    a: 'Yes. Every VØR specialist carries full public liability insurance. Your property is always protected and we operate to the highest professional standards on every job.',
  },
  {
    q: 'What if I am not happy with the result?',
    a: 'We stand behind our work 100%. If you are not completely satisfied, we will return and re-clean at no additional cost — no questions asked. Your satisfaction is our guarantee.',
  },
  {
    q: 'How often should I get my windows professionally cleaned?',
    a: 'For most homes we recommend every 3–4 months. Coastal or high-traffic properties benefit from monthly or bi-monthly cleans. We can set up a recurring schedule that suits your property.',
  },
  {
    q: 'Do you clean commercial properties and real estate listings?',
    a: 'Absolutely. We partner with leading real estate agencies across Sydney and the ACT. Pre-sale and open house preparation is one of our most popular services — clean windows can make a measurable difference to a sale price.',
  },
]

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className={styles.faq}>
      <div className={styles.inner}>
        <div className={styles.header}>
          <div className={styles.sectionLabel}>FAQ</div>
          <h2 className={styles.title}>Common <em>Questions.</em></h2>
          <div className={styles.divider} />
        </div>

        <div className={styles.list}>
          {faqs.map((f, i) => (
            <div key={i} className={`${styles.item} ${open === i ? styles.itemOpen : ''}`}>
              <button
                className={styles.question}
                onClick={() => setOpen(open === i ? null : i)}
                aria-expanded={open === i}
              >
                <span>{f.q}</span>
                <span className={styles.chevron} aria-hidden>{open === i ? '−' : '+'}</span>
              </button>
              <div className={styles.answer}>
                <p>{f.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
