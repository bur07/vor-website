'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from './BookingForm.module.css'

interface Assignment {
  refCode: string
  tier: string
  price: number
  note: string
}

interface ClientData {
  name: string
  email: string
  phone: string
  date: string
  time: string
}

type LookupState = 'idle' | 'not_ready' | 'found'
type Step = 'form' | 'review'
type Status = 'idle' | 'loading' | 'error'

const EMPTY_CLIENT: ClientData = { name: '', email: '', phone: '', date: '', time: '' }

function Radio({ label, value, current, onSelect }: { label: string; value: string; current: string; onSelect: (v: string) => void }) {
  return (
    <button type="button"
      className={`${styles.radio} ${current === value ? styles.radioOn : ''}`}
      onClick={() => onSelect(value)}>
      {label}
    </button>
  )
}

export default function BookingForm() {
  const searchParams = useSearchParams()
  const [refInput, setRefInput]     = useState('')
  const [lookup, setLookup]         = useState<LookupState>('idle')
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [client, setClient]         = useState<ClientData>(EMPTY_CLIENT)
  const [payment, setPayment]       = useState<'deposit' | 'full'>('full')
  const [errors, setErrors]         = useState<Partial<ClientData>>({})
  const [step, setStep]             = useState<Step>('form')
  const [status, setStatus]         = useState<Status>('idle')

  const doLookup = (code: string) => {
    const c = code.trim().toUpperCase()
    if (!c) return
    try {
      const stored = localStorage.getItem('vor_quotes')
      if (!stored) { setLookup('not_ready'); return }
      const quotes = JSON.parse(stored)
      const match = quotes[c] as Assignment | undefined
      if (!match) { setLookup('not_ready'); return }
      setAssignment(match)
      setLookup('found')
    } catch {
      setLookup('not_ready')
    }
  }

  useEffect(() => {
    const ref = searchParams.get('ref')
    if (ref) {
      setRefInput(ref.toUpperCase())
      doLookup(ref)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLookup = () => doLookup(refInput)

  const deposit    = assignment ? Math.round(assignment.price * 0.2) : 0
  const amountPaid = payment === 'deposit' ? deposit : (assignment?.price ?? 0)
  const balanceDue = payment === 'deposit' ? (assignment?.price ?? 0) - deposit : 0
  const paymentType = payment === 'deposit' ? '20% Deposit' : 'Full Payment'

  const setC = (field: keyof ClientData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => setClient(c => ({ ...c, [field]: e.target.value }))

  const validate = (): Partial<ClientData> => {
    const e: Partial<ClientData> = {}
    if (!client.name.trim())  e.name  = 'Required'
    if (!client.email.trim() || !/\S+@\S+\.\S+/.test(client.email)) e.email = 'Valid email required'
    if (!client.phone.trim()) e.phone = 'Required'
    if (!client.date)         e.date  = 'Required'
    if (!client.time)         e.time  = 'Required'
    return e
  }

  const handleReview = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setStep('review')
  }

  const handlePay = async () => {
    setStatus('loading')
    try {
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refCode:     assignment!.refCode,
          tier:        assignment!.tier,
          price:       assignment!.price,
          note:        assignment!.note,
          paymentType,
          amountPaid,
          balanceDue,
          ...client,
        }),
      })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error()
      window.location.href = data.url
    } catch {
      setStatus('error')
    }
  }

  const today = new Date().toISOString().split('T')[0]

  // ── Review / payment summary screen ──────────────────────────
  if (step === 'review' && assignment) {
    return (
      <div className={styles.wrap}>
        <div className={styles.reviewCard}>
          <div className={styles.reviewHeader}>
            <div className={styles.reviewEyebrow}>Order Summary</div>
            <div className={styles.reviewTitle}>{assignment.tier}</div>
            <div className={styles.reviewRef}>{assignment.refCode}</div>
          </div>

          <div className={styles.reviewRows}>
            <div className={styles.reviewRow}><span>Name</span><strong>{client.name}</strong></div>
            <div className={styles.reviewRow}><span>Email</span><strong>{client.email}</strong></div>
            <div className={styles.reviewRow}><span>Phone</span><strong>{client.phone}</strong></div>
            <div className={styles.reviewRow}><span>Date</span><strong>{client.date}</strong></div>
            <div className={styles.reviewRow}><span>Time</span><strong>{client.time}</strong></div>
            {assignment.note && <div className={styles.reviewRow}><span>Note</span><strong>{assignment.note}</strong></div>}
          </div>

          <div className={styles.reviewPayment}>
            <div className={styles.reviewPayType}>{paymentType}</div>
            <div className={styles.reviewAmount}>${amountPaid.toLocaleString()} <span>AUD</span></div>
            {balanceDue > 0 && (
              <div className={styles.reviewBalance}>${balanceDue.toLocaleString()} AUD balance due on the day</div>
            )}
          </div>

          {status === 'error' && (
            <p className={styles.submitErr}>
              Payment could not be started. Please call Noah on 0416 572 468.
            </p>
          )}

          <button
            type="button"
            className={styles.payBtn}
            onClick={handlePay}
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Redirecting to payment...' : `Pay $${amountPaid.toLocaleString()} AUD →`}
          </button>

          <button type="button" className={styles.backBtn} onClick={() => { setStep('form'); setStatus('idle') }}>
            ← Edit details
          </button>
        </div>
      </div>
    )
  }

  // ── Main booking form ─────────────────────────────────────────
  return (
    <div className={styles.wrap}>
      {/* Step 1 — Reference code lookup */}
      <div className={styles.lookupCard}>
        <div className={styles.lookupLabel}>Enter Your Quote Reference</div>
        <div className={styles.lookupRow}>
          <input
            type="text"
            className={styles.lookupInput}
            placeholder="VOR-XXXX"
            value={refInput}
            onChange={e => { setRefInput(e.target.value.toUpperCase()); setLookup('idle') }}
            onKeyDown={e => e.key === 'Enter' && handleLookup()}
            maxLength={8}
          />
          <button type="button" className={styles.lookupBtn} onClick={handleLookup}>
            Look Up →
          </button>
        </div>
        {lookup === 'not_ready' && (
          <div className={styles.notReady}>
            Your quote is not ready yet — we&apos;ll contact you within 24 hours.
          </div>
        )}
      </div>

      {/* Step 2 — Quote found */}
      {lookup === 'found' && assignment && (
        <div className={styles.bookCard}>
          {/* Service summary */}
          <div className={styles.serviceBanner}>
            <div className={styles.serviceInfo}>
              <div className={styles.serviceRef}>{assignment.refCode}</div>
              <div className={styles.serviceTier}>{assignment.tier}</div>
              {assignment.note && <div className={styles.serviceNote}>{assignment.note}</div>}
            </div>
            <div className={styles.servicePrice}>${assignment.price.toLocaleString()}<span> AUD</span></div>
          </div>

          {/* Client details */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Your Details</div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Full Name <span className={styles.req}>*</span></label>
                <input type="text" placeholder="James Anderson" value={client.name} onChange={setC('name')} className={errors.name ? styles.inputErr : ''} />
                {errors.name && <span className={styles.err}>{errors.name}</span>}
              </div>
              <div className={styles.field}>
                <label>Phone <span className={styles.req}>*</span></label>
                <input type="tel" placeholder="0400 000 000" value={client.phone} onChange={setC('phone')} className={errors.phone ? styles.inputErr : ''} />
                {errors.phone && <span className={styles.err}>{errors.phone}</span>}
              </div>
            </div>
            <div className={styles.fieldFull}>
              <label>Email Address <span className={styles.req}>*</span></label>
              <input type="email" placeholder="james@email.com" value={client.email} onChange={setC('email')} className={errors.email ? styles.inputErr : ''} />
              {errors.email && <span className={styles.err}>{errors.email}</span>}
            </div>
          </div>

          {/* Appointment */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Appointment</div>
            <div className={styles.row}>
              <div className={styles.field}>
                <label>Preferred Date <span className={styles.req}>*</span></label>
                <input type="date" value={client.date} onChange={setC('date')} min={today} className={errors.date ? styles.inputErr : ''} />
                {errors.date && <span className={styles.err}>{errors.date}</span>}
              </div>
              <div className={styles.field}>
                <label>Preferred Time <span className={styles.req}>*</span></label>
                <div className={styles.radioGroup}>
                  {['Morning (8am–12pm)', 'Afternoon (12pm–5pm)', 'Flexible'].map(v => (
                    <Radio key={v} label={v} value={v} current={client.time} onSelect={v => { setClient(c => ({ ...c, time: v })); setErrors(e => ({ ...e, time: undefined })) }} />
                  ))}
                </div>
                {errors.time && <span className={styles.err}>{errors.time}</span>}
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className={styles.section}>
            <div className={styles.sectionLabel}>Payment</div>
            <div className={styles.paymentGrid}>
              <button type="button"
                className={`${styles.payCard} ${payment === 'full' ? styles.paySelected : ''}`}
                onClick={() => setPayment('full')}>
                <span className={styles.payAmount}>${assignment.price.toLocaleString()}</span>
                <span className={styles.payLabel}>Full Payment</span>
                <span className={styles.paySub}>Nothing due on day</span>
              </button>
              <button type="button"
                className={`${styles.payCard} ${payment === 'deposit' ? styles.paySelected : ''}`}
                onClick={() => setPayment('deposit')}>
                <span className={styles.payAmount}>${deposit.toLocaleString()}</span>
                <span className={styles.payLabel}>20% Deposit</span>
                <span className={styles.paySub}>${balanceDue.toLocaleString()} balance on day</span>
              </button>
            </div>
          </div>

          <button type="button" className={styles.submit} onClick={handleReview}>
            Review &amp; Pay →
          </button>
        </div>
      )}
    </div>
  )
}
