'use client'

import { useState, useEffect } from 'react'
import styles from './QuoteForm.module.css'

interface QuoteData {
  name: string; email: string; phone: string; address: string
  propertyType: string; propertySize: string; storeys: string
  inspectionDate: string; inspectionTime: string; serviceArea: string
  specialRequirements: string
}

const EMPTY: QuoteData = {
  name: '', email: '', phone: '', address: '',
  propertyType: '', propertySize: '', storeys: '',
  inspectionDate: '', inspectionTime: '', serviceArea: '',
  specialRequirements: '',
}

type Status = 'idle' | 'loading' | 'success' | 'error'

function generateRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = 'VOR-'
  for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return code
}

function Radio({ label, value, current, onSelect }: { label: string; value: string; current: string; onSelect: (v: string) => void }) {
  return (
    <button type="button"
      className={`${styles.radio} ${current === value ? styles.radioOn : ''}`}
      onClick={() => onSelect(value)}>
      {label}
    </button>
  )
}

export default function QuoteForm() {
  const [refCode, setRefCode] = useState('')
  const [form, setForm] = useState<QuoteData>(EMPTY)
  const [errors, setErrors] = useState<Partial<QuoteData>>({})
  const [status, setStatus] = useState<Status>('idle')

  useEffect(() => { setRefCode(generateRef()) }, [])

  const set = (field: keyof QuoteData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))

  const pick = (field: keyof QuoteData) => (v: string) => setForm(f => ({ ...f, [field]: v }))

  const validate = () => {
    const e: Partial<QuoteData> = {}
    if (!form.name.trim())           e.name = 'Required'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
    if (!form.phone.trim())          e.phone = 'Required'
    if (!form.address.trim())        e.address = 'Required'
    if (!form.propertyType)          e.propertyType = 'Required'
    if (!form.propertySize)          e.propertySize = 'Required'
    if (!form.storeys)               e.storeys = 'Required'
    if (!form.inspectionDate)        e.inspectionDate = 'Required'
    if (!form.inspectionTime)        e.inspectionTime = 'Required'
    if (!form.serviceArea)           e.serviceArea = 'Required'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setStatus('loading')
    try {
      const res = await fetch('/api/send-quote-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'quote', refCode, ...form }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.success}>
        <div className={styles.successIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/>
          </svg>
        </div>
        <div className={styles.successTitle}>Quote Requested</div>
        <p className={styles.successSub}>Keep your reference code — you'll need it to book once your quote is ready.</p>
        <div className={styles.refBox}>
          <div className={styles.refLabel}>Your Reference Code</div>
          <div className={styles.refCode}>{refCode}</div>
          <div className={styles.refNote}>A confirmation has been sent to {form.email}</div>
        </div>
        <p className={styles.successSub} style={{ marginTop: '1.5rem' }}>
          Noah will be in touch within 24 hours. Then visit <strong>/booking</strong> to complete your booking.
        </p>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className={styles.form}>
      <div className={styles.refBadge}>
        Reference: <strong>{refCode}</strong>
      </div>

      {/* Personal */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Your Details</div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>Full Name <span className={styles.req}>*</span></label>
            <input type="text" placeholder="James Anderson" value={form.name} onChange={set('name')} className={errors.name ? styles.inputErr : ''} />
            {errors.name && <span className={styles.err}>{errors.name}</span>}
          </div>
          <div className={styles.field}>
            <label>Phone <span className={styles.req}>*</span></label>
            <input type="tel" placeholder="0400 000 000" value={form.phone} onChange={set('phone')} className={errors.phone ? styles.inputErr : ''} />
            {errors.phone && <span className={styles.err}>{errors.phone}</span>}
          </div>
        </div>
        <div className={styles.fieldFull}>
          <label>Email Address <span className={styles.req}>*</span></label>
          <input type="email" placeholder="james@email.com" value={form.email} onChange={set('email')} className={errors.email ? styles.inputErr : ''} />
          {errors.email && <span className={styles.err}>{errors.email}</span>}
        </div>
      </div>

      {/* Property */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Property Details</div>
        <div className={styles.fieldFull}>
          <label>Property Address <span className={styles.req}>*</span></label>
          <input type="text" placeholder="123 Ocean View Drive, Manly NSW 2095" value={form.address} onChange={set('address')} className={errors.address ? styles.inputErr : ''} />
          {errors.address && <span className={styles.err}>{errors.address}</span>}
        </div>
        <div className={styles.field}>
          <label>Property Type <span className={styles.req}>*</span></label>
          <div className={styles.radioGroup}>
            {['House', 'Apartment', 'Townhouse'].map(v => (
              <Radio key={v} label={v} value={v} current={form.propertyType} onSelect={pick('propertyType')} />
            ))}
          </div>
          {errors.propertyType && <span className={styles.err}>{errors.propertyType}</span>}
        </div>
        <div className={styles.field}>
          <label>Property Size <span className={styles.req}>*</span></label>
          <div className={styles.radioGroup}>
            {['Small', 'Medium', 'Large', 'Estate'].map(v => (
              <Radio key={v} label={v} value={v} current={form.propertySize} onSelect={pick('propertySize')} />
            ))}
          </div>
          {errors.propertySize && <span className={styles.err}>{errors.propertySize}</span>}
        </div>
        <div className={styles.field}>
          <label>Number of Storeys <span className={styles.req}>*</span></label>
          <div className={styles.radioGroup}>
            {['Single', 'Double', '3+ Storeys', 'Split Level'].map(v => (
              <Radio key={v} label={v} value={v} current={form.storeys} onSelect={pick('storeys')} />
            ))}
          </div>
          {errors.storeys && <span className={styles.err}>{errors.storeys}</span>}
        </div>
      </div>

      {/* Schedule */}
      <div className={styles.section}>
        <div className={styles.sectionLabel}>Inspection Preference</div>
        <div className={styles.row}>
          <div className={styles.field}>
            <label>Preferred Date <span className={styles.req}>*</span></label>
            <input type="date" value={form.inspectionDate} onChange={set('inspectionDate')} min={today} className={errors.inspectionDate ? styles.inputErr : ''} />
            {errors.inspectionDate && <span className={styles.err}>{errors.inspectionDate}</span>}
          </div>
          <div className={styles.field}>
            <label>Preferred Time <span className={styles.req}>*</span></label>
            <div className={styles.radioGroup}>
              {['Morning (8am–12pm)', 'Afternoon (12pm–5pm)', 'Flexible'].map(v => (
                <Radio key={v} label={v} value={v} current={form.inspectionTime} onSelect={pick('inspectionTime')} />
              ))}
            </div>
            {errors.inspectionTime && <span className={styles.err}>{errors.inspectionTime}</span>}
          </div>
        </div>
        <div className={styles.field}>
          <label>Service Area <span className={styles.req}>*</span></label>
          <div className={styles.radioGroup}>
            {['Sydney', 'ACT', 'Both'].map(v => (
              <Radio key={v} label={v} value={v} current={form.serviceArea} onSelect={pick('serviceArea')} />
            ))}
          </div>
          {errors.serviceArea && <span className={styles.err}>{errors.serviceArea}</span>}
        </div>
        <div className={styles.fieldFull}>
          <label>Special Requirements</label>
          <textarea placeholder="Access codes, height restrictions, fragile features, pets on property..." value={form.specialRequirements} onChange={set('specialRequirements')} />
        </div>
      </div>

      {status === 'error' && (
        <p className={styles.submitErr}>Something went wrong. Please call Noah on 0416 572 468.</p>
      )}

      <button type="button" className={styles.submit} onClick={handleSubmit} disabled={status === 'loading'}>
        {status === 'loading' ? 'Sending...' : 'Request Quote →'}
      </button>
    </div>
  )
}
