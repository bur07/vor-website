'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { use } from 'react'
import styles from './page.module.css'

interface Quote {
  refCode: string
  tier: string
  price: number
  note: string
  clientName?: string
  clientSignedAt?: string
  quoteValidUntil?: string
}

export default function SignPage({ params }: { params: Promise<{ refCode: string }> }) {
  const { refCode } = use(params)

  const [quote,   setQuote]   = useState<Quote | null>(null)
  const [status,  setStatus]  = useState<'loading' | 'ready' | 'not-found' | 'already-signed' | 'expired' | 'done'>('loading')
  const [mode,    setMode]    = useState<'draw' | 'type'>('draw')
  const [typed,   setTyped]   = useState('')
  const [drawn,   setDrawn]   = useState(false)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const canvasRef  = useRef<HTMLCanvasElement>(null)
  const isDrawing  = useRef(false)
  const lastPos    = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    fetch(`/api/public-quote?ref=${refCode}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setStatus('not-found'); return }
        if (d.clientSignedAt) { setQuote(d); setStatus('already-signed'); return }
        if (d.quoteValidUntil && new Date(d.quoteValidUntil) < new Date()) { setQuote(d); setStatus('expired'); return }
        setQuote(d)
        setStatus('ready')
      })
      .catch(() => setStatus('not-found'))
  }, [refCode])

  // Canvas helpers
  const getPos = (clientX: number, clientY: number, canvas: HTMLCanvasElement) => {
    const r = canvas.getBoundingClientRect()
    return {
      x: (clientX - r.left) * (canvas.width  / r.width),
      y: (clientY - r.top)  * (canvas.height / r.height),
    }
  }

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current; if (!canvas) return
    e.preventDefault()
    isDrawing.current = true
    const src = 'touches' in e ? e.touches[0] : e
    const p   = getPos(src.clientX, src.clientY, canvas)
    lastPos.current = p
    const ctx = canvas.getContext('2d')!
    ctx.beginPath(); ctx.moveTo(p.x, p.y)
  }, [])

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing.current) return
    e.preventDefault()
    const canvas = canvasRef.current; if (!canvas) return
    const src = 'touches' in e ? e.touches[0] : e
    const p   = getPos(src.clientX, src.clientY, canvas)
    const ctx = canvas.getContext('2d')!
    ctx.lineWidth   = 2.5
    ctx.lineCap     = 'round'
    ctx.lineJoin    = 'round'
    ctx.strokeStyle = '#1B3A5C'
    if (lastPos.current) {
      ctx.beginPath()
      ctx.moveTo(lastPos.current.x, lastPos.current.y)
      ctx.lineTo(p.x, p.y)
      ctx.stroke()
    }
    lastPos.current = p
    setDrawn(true)
  }, [])

  const stopDraw = useCallback(() => { isDrawing.current = false; lastPos.current = null }, [])

  const clearCanvas = () => {
    const canvas = canvasRef.current; if (!canvas) return
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
    setDrawn(false)
  }

  const submit = async () => {
    if (!quote) return
    const sig = mode === 'type' ? typed.trim() : canvasRef.current?.toDataURL('image/png')
    if (!sig) return
    setSaving(true); setError(null)
    try {
      const res = await fetch('/api/sign-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refCode: quote.refCode, signature: sig }),
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? 'Something went wrong')
      } else {
        setStatus('done')
      }
    } catch { setError('Network error — please try again') }
    setSaving(false)
  }

  const canSubmit = mode === 'draw' ? drawn : typed.trim().length > 1

  // ── Render states ──────────────────────────────────────

  if (status === 'loading') return (
    <div className={styles.page}>
      <Header />
      <div className={styles.center}><div className={styles.spinner} /></div>
    </div>
  )

  if (status === 'not-found') return (
    <div className={styles.page}>
      <Header />
      <div className={styles.center}>
        <div className={styles.stateIcon}>✕</div>
        <p className={styles.stateTitle}>Quote not found</p>
        <p className={styles.stateSub}>This link may be invalid or expired. Please contact VØR Window Co.</p>
      </div>
    </div>
  )

  if (status === 'already-signed') return (
    <div className={styles.page}>
      <Header />
      <div className={styles.center}>
        <div className={`${styles.stateIcon} ${styles.green}`}>✓</div>
        <p className={styles.stateTitle}>Already signed</p>
        <p className={styles.stateSub}>
          This quote was accepted on {new Date(quote!.clientSignedAt!).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' })}.
        </p>
      </div>
    </div>
  )

  if (status === 'expired') return (
    <div className={styles.page}>
      <Header />
      <div className={styles.center}>
        <div className={`${styles.stateIcon} ${styles.red}`}>✕</div>
        <p className={styles.stateTitle}>Quote expired</p>
        <p className={styles.stateSub}>
          This quote expired on {quote?.quoteValidUntil ? new Date(quote.quoteValidUntil).toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' }) : 'a previous date'}.
          Please contact VØR Window Co. for a fresh quote.
        </p>
      </div>
    </div>
  )

  if (status === 'done') return (
    <div className={styles.page}>
      <Header />
      <div className={styles.center}>
        <div className={`${styles.stateIcon} ${styles.green}`}>✓</div>
        <p className={styles.stateTitle}>Quote accepted</p>
        <p className={styles.stateSub}>
          Thank you, {quote?.clientName}. We'll be in touch shortly to confirm your appointment.
        </p>
        <p className={styles.contact}>
          Questions? Call <a href="tel:+61416572468">0416 572 468</a> or email <a href="mailto:info@vorwindowco.com">info@vorwindowco.com</a>
        </p>
      </div>
    </div>
  )

  return (
    <div className={styles.page}>
      <Header />

      <div className={styles.container}>

        {/* Quote summary */}
        <div className={styles.summary}>
          <div className={styles.summaryRef}>{quote!.refCode}</div>
          <div className={styles.summaryName}>{quote!.clientName}</div>
          <div className={styles.summaryService}>{quote!.tier}</div>
          <div className={styles.summaryPrice}>${quote!.price.toLocaleString('en-AU', { minimumFractionDigits: 2 })} AUD</div>
        </div>

        <div className={styles.divider} />

        {/* Signing section */}
        <p className={styles.instruction}>
          By signing below you confirm acceptance of this quote and the terms provided.
        </p>

        {/* Mode toggle */}
        <div className={styles.modeToggle}>
          <button
            className={`${styles.modeBtn} ${mode === 'draw' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('draw')}
          >Draw</button>
          <button
            className={`${styles.modeBtn} ${mode === 'type' ? styles.modeBtnActive : ''}`}
            onClick={() => setMode('type')}
          >Type</button>
        </div>

        {mode === 'draw' ? (
          <div className={styles.canvasWrap}>
            <canvas
              ref={canvasRef}
              width={600}
              height={180}
              className={styles.canvas}
              onMouseDown={startDraw}
              onMouseMove={draw}
              onMouseUp={stopDraw}
              onMouseLeave={stopDraw}
              onTouchStart={startDraw}
              onTouchMove={draw}
              onTouchEnd={stopDraw}
            />
            <div className={styles.canvasHint}>Sign above</div>
            {drawn && <button className={styles.clearBtn} onClick={clearCanvas}>Clear</button>}
          </div>
        ) : (
          <div className={styles.typeWrap}>
            <input
              className={styles.typeInput}
              value={typed}
              onChange={e => setTyped(e.target.value)}
              placeholder="Type your full name"
              autoFocus
            />
            {typed && (
              <div className={styles.typedPreview}>{typed}</div>
            )}
          </div>
        )}

        {error && <div className={styles.errMsg}>{error}</div>}

        <button
          className={styles.acceptBtn}
          onClick={submit}
          disabled={saving || !canSubmit}
        >
          {saving ? 'Saving…' : 'Accept & Sign Quote'}
        </button>

        <p className={styles.legal}>
          Your electronic signature has the same legal effect as a handwritten signature.
        </p>

      </div>

      <footer className={styles.footer}>
        VØR Window Co. · Sydney &amp; ACT · info@vorwindowco.com
      </footer>
    </div>
  )
}

function Header() {
  return (
    <div className={styles.header}>
      <span className={styles.logo}>VØR<span className={styles.dot}>.</span></span>
      <span className={styles.logoSub}>Window Co.</span>
    </div>
  )
}
