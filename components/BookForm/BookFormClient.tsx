'use client'

import { useState } from 'react'
import styles from './BookForm.module.css'

interface FormData {
  firstName: string; lastName: string; email: string; phone: string; contactPreference: string
  propertyType: string; address: string; suburb: string; postcode: string
  storeys: string; windowCount: string; accessNotes: string
  service: string; inclusions: string[]; frequency: string
  date: string; altDate: string; preferredTime: string; referral: string; notes: string
}

const EMPTY: FormData = {
  firstName: '', lastName: '', email: '', phone: '', contactPreference: '',
  propertyType: '', address: '', suburb: '', postcode: '', storeys: '', windowCount: '', accessNotes: '',
  service: '', inclusions: ['Exterior Windows'], frequency: '',
  date: '', altDate: '', preferredTime: '', referral: '', notes: '',
}

type Status = 'idle' | 'loading' | 'success' | 'error'

const STEPS = [
  { title: 'Your Details',  sub: 'Who are we speaking with?' },
  { title: 'Your Property', sub: 'Tell us about your property' },
  { title: 'Your Service',  sub: 'What do you need?' },
  { title: 'Schedule',      sub: 'When works for you?' },
]

const PACKAGES = [
  { value: 'residential-small', price: '$299',      label: 'Small Home',     sub: 'Up to 15 windows' },
  { value: 'residential-mid',   price: '$399',      label: 'Mid-Size Estate', sub: '15–25 windows, multi-level' },
  { value: 'premium-estate',    price: 'from $599', label: 'Premium Estate',  sub: '25+ windows, luxury finishes' },
  { value: 'commercial',        price: 'Quote',     label: 'Commercial',      sub: 'Offices, retail & strata' },
]

const INCLUSIONS = [
  'Exterior Windows',
  'Interior Windows',
  'Frames & Tracks',
  'Fly Screen Cleaning',
  'Post-Construction Clean',
]

function Field({ label, error, required, children }: {
  label: string; error?: string; required?: boolean; children: React.ReactNode
}) {
  return (
    <div className={styles.formGroup}>
      <label>{label}{required && <span className={styles.req}> *</span>}</label>
      {children}
      {error && <span className={styles.fieldError}>{error}</span>}
    </div>
  )
}

export default function BookFormClient() {
  const [step, setStep]     = useState(1)
  const [form, setForm]     = useState<FormData>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<Status>('idle')

  const set = (field: keyof FormData) => (value: string) =>
    setForm(f => ({ ...f, [field]: value }))

  const setInput = (field: keyof FormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      set(field)(e.target.value)

  const toggleInclusion = (item: string) =>
    setForm(f => ({
      ...f,
      inclusions: f.inclusions.includes(item)
        ? f.inclusions.filter(i => i !== item)
        : [...f.inclusions, item],
    }))

  const validate = (s: number): Record<string, string> => {
    const e: Record<string, string> = {}
    if (s === 1) {
      if (!form.firstName.trim()) e.firstName = 'Required'
      if (!form.lastName.trim())  e.lastName  = 'Required'
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required'
      if (!form.phone.trim())     e.phone     = 'Required'
      if (!form.contactPreference) e.contactPreference = 'Please select one'
    }
    if (s === 2) {
      if (!form.propertyType) e.propertyType = 'Please select one'
      if (!form.address.trim())  e.address  = 'Required'
      if (!form.suburb.trim())   e.suburb   = 'Required'
      if (!form.postcode.trim()) e.postcode = 'Required'
      if (!form.storeys)      e.storeys      = 'Please select one'
      if (!form.windowCount)  e.windowCount  = 'Please select one'
    }
    if (s === 3) {
      if (!form.service)   e.service   = 'Please select a package'
      if (!form.frequency) e.frequency = 'Please select one'
    }
    if (s === 4) {
      if (!form.date)          e.date          = 'Required'
      if (!form.preferredTime) e.preferredTime = 'Please select one'
    }
    return e
  }

  const next = () => {
    const e = validate(step)
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setStep(s => Math.min(s + 1, 4))
  }

  const back = () => { setErrors({}); setStep(s => Math.max(s - 1, 1)) }

  const submit = async () => {
    const e = validate(4)
    if (Object.keys(e).length) { setErrors(e); return }
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, inclusions: form.inclusions.join(', ') }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.successState}>
        <div className={styles.successIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
            <polyline points="22,4 12,14.01 9,11.01" />
          </svg>
        </div>
        <div className={styles.successTitle}>Consultation Requested</div>
        <p className={styles.successMsg}>
          Thank you, {form.firstName}. Noah will review your details and be in touch within 24 hours to confirm your booking.
        </p>
        <div className={styles.successDetail}>
          <strong>What happens next?</strong>
          <ol>
            <li>Noah reviews your property details and service requirements</li>
            <li>He&apos;ll contact you on {form.phone} via {form.contactPreference.toLowerCase()} to confirm</li>
            <li>A confirmation with your appointment details is sent to {form.email}</li>
          </ol>
        </div>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className={styles.wizard}>
      {/* Progress bar */}
      <div className={styles.wizardProgress}>
        <div className={styles.wizardProgressFill} style={{ width: `${((step - 1) / 4) * 100}%` }} />
      </div>

      {/* Step header */}
      <div className={styles.wizardStepHeader}>
        <span className={styles.wizardStepCount}>Step {step} of 4</span>
        <span className={styles.wizardStepTitle}>{STEPS[step - 1].title}</span>
        <span className={styles.wizardStepSub}>{STEPS[step - 1].sub}</span>
      </div>

      {/* Fields */}
      <div className={styles.wizardBody}>

        {step === 1 && <>
          <div className={styles.formRow}>
            <Field label="First Name" error={errors.firstName} required>
              <input type="text" placeholder="James" value={form.firstName} onChange={setInput('firstName')} className={errors.firstName ? styles.inputError : ''} />
            </Field>
            <Field label="Last Name" error={errors.lastName} required>
              <input type="text" placeholder="Anderson" value={form.lastName} onChange={setInput('lastName')} className={errors.lastName ? styles.inputError : ''} />
            </Field>
          </div>
          <div className={styles.formRow}>
            <Field label="Email Address" error={errors.email} required>
              <input type="email" placeholder="james@email.com" value={form.email} onChange={setInput('email')} className={errors.email ? styles.inputError : ''} />
            </Field>
            <Field label="Phone Number" error={errors.phone} required>
              <input type="tel" placeholder="0400 000 000" value={form.phone} onChange={setInput('phone')} className={errors.phone ? styles.inputError : ''} />
            </Field>
          </div>
          <Field label="Preferred Contact Method" error={errors.contactPreference} required>
            <div className={styles.radioRow}>
              {['Phone Call', 'SMS', 'Email'].map(opt => (
                <button key={opt} type="button"
                  className={`${styles.radioOption} ${form.contactPreference === opt ? styles.radioSelected : ''}`}
                  onClick={() => set('contactPreference')(opt)}>
                  {opt}
                </button>
              ))}
            </div>
          </Field>
        </>}

        {step === 2 && <>
          <Field label="Property Type" error={errors.propertyType} required>
            <div className={styles.cardGrid}>
              {[
                { value: 'residential', label: 'Residential',  sub: 'House or apartment' },
                { value: 'commercial',  label: 'Commercial',   sub: 'Office or retail' },
                { value: 'realestate',  label: 'Real Estate',  sub: 'Open home / listing' },
              ].map(opt => (
                <button key={opt.value} type="button"
                  className={`${styles.cardOption} ${form.propertyType === opt.value ? styles.cardSelected : ''}`}
                  onClick={() => set('propertyType')(opt.value)}>
                  <span className={styles.cardOptionLabel}>{opt.label}</span>
                  <span className={styles.cardOptionSub}>{opt.sub}</span>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Street Address" error={errors.address} required>
            <input type="text" placeholder="123 Ocean View Drive" value={form.address} onChange={setInput('address')} className={errors.address ? styles.inputError : ''} />
          </Field>
          <div className={styles.formRow}>
            <Field label="Suburb" error={errors.suburb} required>
              <input type="text" placeholder="Manly" value={form.suburb} onChange={setInput('suburb')} className={errors.suburb ? styles.inputError : ''} />
            </Field>
            <Field label="Postcode" error={errors.postcode} required>
              <input type="text" placeholder="2095" value={form.postcode} onChange={setInput('postcode')} className={errors.postcode ? styles.inputError : ''} />
            </Field>
          </div>
          <Field label="Number of Storeys" error={errors.storeys} required>
            <div className={styles.radioRow}>
              {['Single', 'Double', '3+ Storeys', 'Split Level'].map(opt => (
                <button key={opt} type="button"
                  className={`${styles.radioOption} ${form.storeys === opt ? styles.radioSelected : ''}`}
                  onClick={() => set('storeys')(opt)}>
                  {opt}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Estimated Number of Windows" error={errors.windowCount} required>
            <select value={form.windowCount} onChange={setInput('windowCount')} className={errors.windowCount ? styles.inputError : ''}>
              <option value="">Select an estimate...</option>
              <option value="1–10 windows">1–10 windows</option>
              <option value="11–20 windows">11–20 windows</option>
              <option value="21–35 windows">21–35 windows</option>
              <option value="36+ windows">36+ windows</option>
            </select>
          </Field>
          <Field label="Access Challenges or Special Notes">
            <input type="text" placeholder="e.g. Security gate, high-rise, pets on property..." value={form.accessNotes} onChange={setInput('accessNotes')} />
          </Field>
        </>}

        {step === 3 && <>
          <Field label="Service Package" error={errors.service} required>
            <div className={styles.packageGrid}>
              {PACKAGES.map(pkg => (
                <button key={pkg.value} type="button"
                  className={`${styles.packageCard} ${form.service === pkg.value ? styles.packageSelected : ''}`}
                  onClick={() => set('service')(pkg.value)}>
                  <span className={styles.packagePrice}>{pkg.price}</span>
                  <span className={styles.packageLabel}>{pkg.label}</span>
                  <span className={styles.packageSub}>{pkg.sub}</span>
                </button>
              ))}
            </div>
          </Field>
          <Field label="What Would You Like Cleaned?">
            <div className={styles.checkGrid}>
              {INCLUSIONS.map(item => (
                <button key={item} type="button"
                  className={`${styles.checkItem} ${form.inclusions.includes(item) ? styles.checkSelected : ''}`}
                  onClick={() => toggleInclusion(item)}>
                  <span className={styles.checkMark}>{form.inclusions.includes(item) ? '✓' : ''}</span>
                  {item}
                </button>
              ))}
            </div>
          </Field>
          <Field label="Service Frequency" error={errors.frequency} required>
            <div className={styles.radioRow}>
              {['One-Time', 'Fortnightly', 'Monthly', 'Quarterly'].map(opt => (
                <button key={opt} type="button"
                  className={`${styles.radioOption} ${form.frequency === opt ? styles.radioSelected : ''}`}
                  onClick={() => set('frequency')(opt)}>
                  {opt}
                </button>
              ))}
            </div>
          </Field>
        </>}

        {step === 4 && <>
          <div className={styles.formRow}>
            <Field label="Preferred Date" error={errors.date} required>
              <input type="date" value={form.date} onChange={setInput('date')} min={today} className={errors.date ? styles.inputError : ''} />
            </Field>
            <Field label="Alternative Date">
              <input type="date" value={form.altDate} onChange={setInput('altDate')} min={today} />
            </Field>
          </div>
          <Field label="Preferred Time of Day" error={errors.preferredTime} required>
            <div className={styles.radioRow}>
              {['Morning (8am–12pm)', 'Afternoon (12pm–5pm)', 'Flexible'].map(opt => (
                <button key={opt} type="button"
                  className={`${styles.radioOption} ${form.preferredTime === opt ? styles.radioSelected : ''}`}
                  onClick={() => set('preferredTime')(opt)}>
                  {opt}
                </button>
              ))}
            </div>
          </Field>
          <Field label="How Did You Hear About Us?">
            <select value={form.referral} onChange={setInput('referral')}>
              <option value="">Select an option...</option>
              <option>Google Search</option>
              <option>Instagram</option>
              <option>Facebook</option>
              <option>Friend or Family Referral</option>
              <option>Real Estate Agent</option>
              <option>Letterbox Drop</option>
              <option>Other</option>
            </select>
          </Field>
          <Field label="Special Requirements or Access Notes">
            <textarea placeholder="Gate codes, access instructions, or anything else we should know..." value={form.notes} onChange={setInput('notes')} />
          </Field>
          {status === 'error' && (
            <p className={styles.errorMsg}>Something went wrong. Please call Noah on 0416 572 468.</p>
          )}
        </>}

      </div>

      {/* Navigation */}
      <div className={styles.wizardNav}>
        {step > 1
          ? <button type="button" className={styles.btnBack} onClick={back}>← Back</button>
          : <span />
        }
        {step < 4
          ? <button type="button" className={styles.btnNext} onClick={next}>Continue →</button>
          : <button type="button" className={styles.btnNext} onClick={submit} disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending...' : 'Submit Request →'}
            </button>
        }
      </div>
    </div>
  )
}
