'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import styles from './Nav.module.css'

const links = [
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/gallery', label: 'Gallery' },
  { href: '/book', label: 'Contact' },
]

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => { setMenuOpen(false) }, [pathname])

  return (
    <>
      <nav className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoWord}>VØR<span>.</span></div>
          <div className={styles.logoTagline}>We don't just clean windows — we reveal clarity</div>
        </Link>

        <ul className={styles.links}>
          {links.map(l => (
            <li key={l.href}>
              <Link
                href={l.href}
                className={`${styles.link} ${pathname === l.href ? styles.linkActive : ''}`}
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/book" className={styles.cta}>Book Now</Link>

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

      <div className={`${styles.overlay} ${menuOpen ? styles.overlayOpen : ''}`}>
        <ul className={styles.overlayLinks}>
          {links.map(l => (
            <li key={l.href}>
              <Link href={l.href} className={styles.overlayLink}>
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/book" className={styles.overlayCta}>Book Now</Link>
          </li>
        </ul>
      </div>
    </>
  )
}
