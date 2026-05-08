import Image from 'next/image'
import RevealOnScroll from '@/components/shared/RevealOnScroll'
import styles from './Gallery.module.css'

const items = [
  { cls: 'gi1', src: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80', alt: 'Luxury waterfront home', label: 'Waterfront Estate' },
  { cls: 'gi2', src: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80', alt: 'Modern residence', label: 'Modern Residence' },
  { cls: 'gi3', src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=700&q=80', alt: 'Premium estate', label: 'Premium Estate' },
  { cls: 'gi4', src: 'https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?w=600&q=80', alt: 'Commercial property', label: 'Commercial' },
  { cls: 'gi5', src: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=700&q=80', alt: 'Open house preparation', label: 'Open House Prep' },
  { cls: 'gi6', src: 'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80', alt: 'Luxury interior view', label: 'Luxury Interior' },
]

export default function Gallery() {
  return (
    <section id="gallery" className={styles.gallery}>
      <RevealOnScroll className={styles.intro}>
        <div>
          <div className={styles.sectionLabel}>Our Work</div>
          <h2 className={styles.sectionTitle}>Clarity in <em>Every Detail.</em></h2>
          <div className={styles.divider} />
        </div>
        <p>Explore a selection of our finest work — from modern city apartments to oceanfront estates across Sydney and the ACT. Each image is a testament to our dedication.</p>
      </RevealOnScroll>

      <RevealOnScroll className={styles.grid}>
        {items.map(item => (
          <div key={item.cls} className={`${styles.item} ${styles[item.cls as keyof typeof styles]}`}>
            <Image
              src={item.src}
              alt={item.alt}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width:900px) 50vw, 33vw"
            />
            <span className={styles.label}>{item.label}</span>
          </div>
        ))}
      </RevealOnScroll>
    </section>
  )
}
