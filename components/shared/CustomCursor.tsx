'use client'

import { useEffect, useRef } from 'react'
import styles from './CustomCursor.module.css'

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const dot = dotRef.current
    const ringEl = ringRef.current
    if (!dot || !ringEl) return

    const onMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }
      dot.style.left = `${e.clientX}px`
      dot.style.top = `${e.clientY}px`
    }

    const animate = () => {
      ringEl.style.left = `${mouse.current.x}px`
      ringEl.style.top = `${mouse.current.y}px`
      rafRef.current = requestAnimationFrame(animate)
    }

    const onEnter = () => {
      dot.style.width = '14px'
      dot.style.height = '14px'
      ringEl.style.width = '48px'
      ringEl.style.height = '48px'
      ringEl.style.borderColor = 'var(--blue-royal)'
    }
    const onLeave = () => {
      dot.style.width = '8px'
      dot.style.height = '8px'
      ringEl.style.width = '32px'
      ringEl.style.height = '32px'
      ringEl.style.borderColor = 'var(--blue-baby)'
    }

    const interactiveSelector = 'a,button,.serviceCard,.galleryItem,.whyCard'

    document.addEventListener('mousemove', onMove)
    rafRef.current = requestAnimationFrame(animate)

    const bindInteractive = () => {
      document.querySelectorAll(interactiveSelector).forEach(el => {
        el.addEventListener('mouseenter', onEnter)
        el.addEventListener('mouseleave', onLeave)
      })
    }
    bindInteractive()

    const observer = new MutationObserver(bindInteractive)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafRef.current)
      observer.disconnect()
    }
  }, [])

  return (
    <>
      <div ref={dotRef} className={styles.cursor} />
      <div ref={ringRef} className={styles.cursorRing} />
    </>
  )
}
