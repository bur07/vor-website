'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './Nav.module.css'

const links = [
  { href: '#about', label: 'About' },
  { href: '#services', label: 'Services' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#why', label: 'Why VØR' },
  { href: '#testimonials', label: 'Testimonials' },
  { href: '#book', label: 'Contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 60)
      let cur = ''
      document.querySelectorAll('section[id]').forEach(s => {
        if (window.scrollY >= (s as HTMLElement).offsetTop - 130) cur = s.id
      })
      setActive(cur)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <Link href="#hero" className={styles.logo} onClick={() => setMenuOpen(false)}>
          <div className={styles.logoWord}>VØR<span>.</span></div>
          <div className={styles.logoTagline}>We don't just clean windows — we reveal clarity</div>
        </Link>

        <ul className={styles.links}>
          {links.map(l => (
            <li key={l.href}>
              <a
                href={l.href}
                className={styles.link}
                style={{ color: active === l.href.slice(1) ? 'var(--blue-royal)' : '' }}
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <a href="#book" className={styles.cta}>Book Now</a>

        <button
          className={`${styles.hamburger} ${menuOpen ? styles.open : ''}`}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          <span />
          <span />
          <span />
        </button>
      </nav>

      {/* Mobile overlay */}
      <div className={`${styles.overlay} ${menuOpen ? styles.overlayOpen : ''}`}>
        <ul className={styles.overlayLinks}>
          {links.map(l => (
            <li key={l.href}>
              <a href={l.href} className={styles.overlayLink} onClick={() => setMenuOpen(false)}>
                {l.label}
              </a>
            </li>
          ))}
          <li>
            <a href="#book" className={styles.overlayCta} onClick={() => setMenuOpen(false)}>
              Book Now
            </a>
          </li>
        </ul>
      </div>
    </>
  )
}
