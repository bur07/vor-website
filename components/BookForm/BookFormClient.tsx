'use client'

import { useState } from 'react'
import type { ContactFormData } from '@/types'
import styles from './BookForm.module.css'

const EMPTY: ContactFormData = {
  firstName: '', lastName: '', email: '', phone: '',
  service: '', date: '', address: '', notes: '',
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export default function BookFormClient() {
  const [form, setForm] = useState<ContactFormData>(EMPTY)
  const [status, setStatus] = useState<Status>('idle')

  const set = (field: keyof ContactFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async () => {
    if (!form.firstName || !form.email || !form.phone) {
      alert('Please fill in your name, email, and phone number.')
      return
    }
    setStatus('loading')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className={styles.formWrap}>
        <div className={styles.formTitle}>Request Sent</div>
        <p className={styles.successMsg}>
          Thank you, {form.firstName}. Noah will be in touch within 24 hours to confirm your consultation.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.formWrap}>
      <div className={styles.formTitle}>Request a Consultation</div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>First Name</label>
          <input type="text" placeholder="James" value={form.firstName} onChange={set('firstName')} />
        </div>
        <div className={styles.formGroup}>
          <label>Last Name</label>
          <input type="text" placeholder="Anderson" value={form.lastName} onChange={set('lastName')} />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Email Address</label>
          <input type="email" placeholder="james@email.com" value={form.email} onChange={set('email')} />
        </div>
        <div className={styles.formGroup}>
          <label>Phone Number</label>
          <input type="tel" placeholder="0400 000 000" value={form.phone} onChange={set('phone')} />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label>Service Type</label>
          <select value={form.service} onChange={set('service')}>
            <option value="">Select a service...</option>
            <option>Residential — Small Home ($299 AUD)</option>
            <option>Residential — Mid-Size ($399 AUD)</option>
            <option>Premium Estate ($599+ AUD)</option>
            <option>Commercial Property</option>
            <option>Real Estate Partnership</option>
          </select>
        </div>
        <div className={styles.formGroup}>
          <label>Preferred Date</label>
          <input type="date" value={form.date} onChange={set('date')} />
        </div>
      </div>

      <div className={styles.formRowFull}>
        <div className={styles.formGroup}>
          <label>Property Address</label>
          <input type="text" placeholder="123 Ocean View Drive, Manly NSW 2095" value={form.address} onChange={set('address')} />
        </div>
      </div>

      <div className={styles.formRowFull}>
        <div className={styles.formGroup}>
          <label>Additional Notes</label>
          <textarea placeholder="Tell us about your property or any special requirements..." value={form.notes} onChange={set('notes')} />
        </div>
      </div>

      {status === 'error' && (
        <p className={styles.errorMsg}>Something went wrong. Please call Noah on 0416 572 468.</p>
      )}

      <button
        className={styles.submit}
        onClick={handleSubmit}
        disabled={status === 'loading'}
      >
        {status === 'loading' ? 'Sending...' : 'Request Consultation →'}
      </button>
    </div>
  )
}
