import styles from './Footer.module.css'

export default function Footer() {
  return (
    <>
      <footer className={styles.footer}>
        <div className={styles.brand}>
          <div className={styles.logo}>VØR<span>.</span></div>
          <div className={styles.tagline}>We don't just clean windows — we reveal clarity</div>
          <p>Born on the Northern Beaches of Sydney. Built to scale from Australia to the world. Elevating living, one pane at a time.</p>
          <div className={styles.contactLinks}>
            <a href="tel:+61416572468">Noah Rylands — 0416 572 468</a>
            <a href="mailto:hello@vorwindow.com.au">hello@vorwindow.com.au</a>
            <span>All of Sydney &amp; ACT</span>
          </div>
        </div>

        <div className={styles.col}>
          <h4>Navigation</h4>
          <ul>
            <li><a href="#about">About VØR</a></li>
            <li><a href="#services">Services &amp; Pricing</a></li>
            <li><a href="#gallery">Portfolio</a></li>
            <li><a href="#why">Why VØR</a></li>
            <li><a href="#testimonials">Testimonials</a></li>
            <li><a href="#book">Book a Consultation</a></li>
          </ul>
        </div>

        <div className={styles.col}>
          <h4>Services</h4>
          <ul>
            <li><a href="#services">Residential — Small Home</a></li>
            <li><a href="#services">Mid-Size Estate</a></li>
            <li><a href="#services">Premium Estate</a></li>
            <li><a href="#services">Commercial Properties</a></li>
            <li><a href="#services">Real Estate Partnerships</a></li>
          </ul>
        </div>
      </footer>

      <div className={styles.bottom}>
        <p>© 2025 VØR Window Co. All rights reserved. Noah Rylands — Sydney &amp; ACT. ABN 58 218 225 007</p>
        <div className={styles.vorSign}>VØR</div>
      </div>
    </>
  )
}
