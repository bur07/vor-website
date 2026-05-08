'use client'

import { useEffect, useRef } from 'react'

interface Props {
  children: React.ReactNode
  delay?: number
  className?: string
}

export default function RevealOnScroll({ children, delay = 0, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => el.classList.add('visible'), delay)
          obs.unobserve(el)
        }
      },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])

  return (
    <div ref={ref} className={`reveal${className ? ` ${className}` : ''}`}>
      {children}
    </div>
  )
}
