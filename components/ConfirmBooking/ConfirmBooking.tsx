'use client'

import { useState } from 'react'
import styles from './ConfirmBooking.module.css'

interface Assignment {
  refCode: string
  tier: string
  price: number
  note: string
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  clientAddress?: string
}

type Step = 'lookup' | 'form' | 'sent'
type PayType = 'Full Payment' | '20% Deposit' | 'Cash' | 'Bank Transfer'

const TIMES = Array.from({ length: 12 }, (_, i) => {
  const h = i + 7
  const suffix = h < 12 ? 'am' : 'pm'
  const display = h <= 12 ? h : h - 12
  return `${display}:00${suffix}`
})
const PAY_TYPES: PayType[] = ['Full Payment', '20% Deposit', 'Cash', 'Bank Transfer']

export default function ConfirmBooking() {
  const [authed, setAuthed]       = useState(false)
  const [pw, setPw]               = useState('')
  const [pwErr, setPwErr]         = useState('')
  const [refInput, setRefInput]   = useState('')
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [lookupErr, setLookupErr] = useState('')
  const [looking, setLooking]     = useState(false)
  const [step, setStep]           = useState<Step>('lookup')

  const [date, setDate]           = useState('')
  const [time, setTime]           = useState('')
  const [payType, setPayType]     = useState<PayType>('Full Payment')
  const [amountPaid, setAmountPaid] = useState('')
  const [sending, setSending]     = useState(false)
  const [sendErr, setSendErr]     = useState('')

  const deposit = assignment ? Math.round(assignment.price * 0.2) : 0
  const balanceDue = payType === '20% Deposit' ? (assignment ? assignment.price - deposit : 0) : 0

  const handleLookup = async () => {
    const ref = refInput.trim().toUpperCase()
    if (!ref) return
    setLooking(true)
    setLookupErr('')
    try {
      const res = await fetch(`/api/quote-assignments?ref=${encodeURIComponent(ref)}`)
      const data = await res.json()
      if (!data) { setLookupErr('No assigned quote found for this reference.'); setLooking(false); return }
      setAssignment(data)
      setAmountPaid(String(data.price))
      setStep('form')
    } catch {
      setLookupErr('Lookup failed — please try again.')
    }
    setLooking(false)
  }

  const handleSend = async () => {
    if (!date || !time || !amountPaid) { setSendErr('Date, time and amount paid are required.'); return }
    setSending(true)
    setSendErr('')
    try {
      const res = await fetch('/api/send-confirmation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refCode:     assignment!.refCode,
          name:        assignment!.clientName    ?? '',
          email:       assignment!.clientEmail   ?? '',
          phone:       assignment!.clientPhone   ?? '',
          address:     assignment!.clientAddress ?? '',
          tier:        assignment!.tier,
          price:       assignment!.price,
          note:        assignment!.note,
          paymentType: payType,
          amountPaid,
          balanceDue,
          date,
          time,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      setStep('sent')
    } catch (err) {
      setSendErr(err instanceof Error ? err.message : 'Send failed — please try again.')
    }
    setSending(false)
  }

  const reset = () => {
    setStep('lookup')
    setRefInput('')
    setAssignment(null)
    setLookupErr('')
    setDate('')
    setTime('')
    setPayType('Full Payment')
    setAmountPaid('')
    setSendErr('')
  }

  if (!authed) {
    return (
      <div className={styles.gate}>
        <div className={styles.gateCard}>
          <div className={styles.gateLogo}>VØR<span>.</span></div>
          <div className={styles.gateTitle}>Admin Access</div>
          <input
            type="password"
            className={styles.gateInput}
            placeholder="Password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                if (pw === 'VOR2024') { setAuthed(true); setPwErr('') }
                else setPwErr('Incorrect password.')
              }
            }}
          />
          <button className={styles.gateBtn} onClick={() => {
            if (pw === 'VOR2024') { setAuthed(true); setPwErr('') }
            else setPwErr('Incorrect password.')
          }}>Enter</button>
          {pwErr && <p className={styles.gateErr}>{pwErr}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLogo}>VØR<span>.</span></div>
        <div className={styles.headerSub}>Send Booking Confirmation</div>
        <a href="/admin" className={styles.backLink}>← Quote Admin</a>
      </div>

      <div className={styles.body}>

        {/* ── Step: success ────────────────────────────────── */}
        {step === 'sent' && assignment && (
          <div className={styles.card}>
            <div className={styles.successIcon}>✓</div>
            <div className={styles.successTitle}>Confirmation Sent</div>
            <div className={styles.successSub}>
              Email and SMS sent to {assignment.clientName || assignment.clientEmail} for {assignment.refCode}.
            </div>
            <button className={styles.resetBtn} onClick={reset}>Send Another</button>
          </div>
        )}

        {/* ── Step: lookup ─────────────────────────────────── */}
        {step === 'lookup' && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Find Quote</h2>
            <div className={styles.lookupRow}>
              <input
                className={styles.lookupInput}
                placeholder="VOR-XXXX"
                value={refInput}
                onChange={e => { setRefInput(e.target.value.toUpperCase()); setLookupErr('') }}
                onKeyDown={e => e.key === 'Enter' && handleLookup()}
                maxLength={8}
              />
              <button className={styles.lookupBtn} onClick={handleLookup} disabled={looking}>
                {looking ? '…' : 'Look Up →'}
              </button>
            </div>
            {lookupErr && <p className={styles.err}>{lookupErr}</p>}
          </div>
        )}

        {/* ── Step: confirmation form ───────────────────────── */}
        {step === 'form' && assignment && (
          <>
            <div className={styles.card}>
              <div className={styles.clientBanner}>
                <div className={styles.clientRef}>{assignment.refCode}</div>
                <div className={styles.clientName}>{assignment.clientName || '—'}</div>
                <div className={styles.clientMeta}>
                  {assignment.clientEmail   && <span>{assignment.clientEmail}</span>}
                  {assignment.clientPhone   && <span>{assignment.clientPhone}</span>}
                  {assignment.clientAddress && <span>{assignment.clientAddress}</span>}
                </div>
                <div className={styles.clientService}>
                  <span className={styles.tierBadge}>{assignment.tier}</span>
                  <span className={styles.clientPrice}>${assignment.price.toLocaleString()} AUD</span>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Appointment</h2>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} />
                </div>
                <div className={styles.field}>
                  <label>Time</label>
                  <select value={time} onChange={e => setTime(e.target.value)}>
                    <option value="">Select…</option>
                    {TIMES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Payment</h2>
              <div className={styles.payGrid}>
                {PAY_TYPES.map(p => (
                  <button
                    key={p}
                    type="button"
                    className={`${styles.payOption} ${payType === p ? styles.paySelected : ''}`}
                    onClick={() => {
                      setPayType(p)
                      // Only suggest a default if nothing has been typed yet
                      setAmountPaid(prev => prev || (p === '20% Deposit' ? String(deposit) : String(assignment.price)))
                    }}
                  >{p}</button>
                ))}
              </div>
              <div className={styles.formGrid} style={{ marginTop: '1rem' }}>
                <div className={styles.field}>
                  <label>Amount Paid (AUD)</label>
                  <input
                    type="number"
                    value={amountPaid}
                    onChange={e => setAmountPaid(e.target.value)}
                  />
                </div>
                {balanceDue > 0 && (
                  <div className={styles.field}>
                    <label>Balance Due on Day</label>
                    <input type="number" value={balanceDue} disabled />
                  </div>
                )}
              </div>
            </div>

            {sendErr && <p className={styles.err}>{sendErr}</p>}

            <div className={styles.actions}>
              <button className={styles.backBtn} onClick={reset}>← Change Code</button>
              <button className={styles.sendBtn} onClick={handleSend} disabled={sending}>
                {sending ? 'Sending…' : 'Send Confirmation →'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
