'use client'

import { useState, useEffect } from 'react'
import styles from './AdminPanel.module.css'

interface QuoteAssignment {
  refCode: string
  tier: string
  price: number
  note: string
  assignedAt: string
}

const TIERS = ['Essential', 'Signature', 'Prestige']
const EMPTY_FORM = { refCode: '', tier: 'Essential', price: '', note: '' }

export default function AdminPanel() {
  const [authed, setAuthed]     = useState(false)
  const [pw, setPw]             = useState('')
  const [pwErr, setPwErr]       = useState('')
  const [quotes, setQuotes]     = useState<Record<string, QuoteAssignment>>({})
  const [form, setForm]         = useState(EMPTY_FORM)
  const [editing, setEditing]   = useState<string | null>(null)
  const [flash, setFlash]       = useState('')

  useEffect(() => {
    try {
      const stored = localStorage.getItem('vor_quotes')
      if (stored) setQuotes(JSON.parse(stored))
    } catch {}
  }, [])

  const persist = (updated: Record<string, QuoteAssignment>) => {
    setQuotes(updated)
    localStorage.setItem('vor_quotes', JSON.stringify(updated))
  }

  const showFlash = (msg: string) => {
    setFlash(msg)
    setTimeout(() => setFlash(''), 3000)
  }

  const handleAssign = () => {
    const ref = form.refCode.trim().toUpperCase()
    if (!ref || !form.price) { showFlash('Reference code and price are required.'); return }
    const entry: QuoteAssignment = {
      refCode: ref,
      tier: form.tier,
      price: parseFloat(form.price),
      note: form.note.trim(),
      assignedAt: editing ? (quotes[editing]?.assignedAt ?? new Date().toISOString()) : new Date().toISOString(),
    }
    const updated = { ...quotes }
    if (editing && editing !== ref) delete updated[editing]
    updated[ref] = entry
    persist(updated)
    setForm(EMPTY_FORM)
    setEditing(null)
    showFlash(`${ref} ${editing ? 'updated' : 'assigned'} successfully.`)
  }

  const handleEdit = (q: QuoteAssignment) => {
    setForm({ refCode: q.refCode, tier: q.tier, price: String(q.price), note: q.note })
    setEditing(q.refCode)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = (ref: string) => {
    if (!window.confirm(`Delete ${ref}?`)) return
    const updated = { ...quotes }
    delete updated[ref]
    persist(updated)
    showFlash(`${ref} deleted.`)
  }

  const handleCancel = () => { setForm(EMPTY_FORM); setEditing(null) }

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

  const sorted = Object.values(quotes).sort((a, b) =>
    new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
  )

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerLogo}>VØR<span>.</span></div>
        <div className={styles.headerSub}>Quote Admin</div>
        <button className={styles.logoutBtn} onClick={() => setAuthed(false)}>Sign out</button>
      </div>

      <div className={styles.body}>
        {/* Assign form */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>{editing ? `Editing — ${editing}` : 'Assign Quote'}</h2>
          {flash && <div className={styles.flash}>{flash}</div>}
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Reference Code</label>
              <input
                placeholder="VOR-XXXX"
                value={form.refCode}
                onChange={e => setForm(f => ({ ...f, refCode: e.target.value.toUpperCase() }))}
                disabled={!!editing}
              />
            </div>
            <div className={styles.field}>
              <label>Service Tier</label>
              <select value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}>
                {TIERS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Price (AUD)</label>
              <input
                type="number"
                placeholder="399"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label>Note (optional)</label>
              <input
                placeholder="Includes frames & tracks..."
                value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
              />
            </div>
          </div>
          <div className={styles.formActions}>
            {editing && <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>}
            <button className={styles.assignBtn} onClick={handleAssign}>
              {editing ? 'Update Quote' : 'Assign Quote'}
            </button>
          </div>
        </div>

        {/* Assigned list */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            Assigned Quotes <span className={styles.count}>{sorted.length}</span>
          </h2>
          {sorted.length === 0 ? (
            <p className={styles.empty}>No quotes assigned yet.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Ref Code</th>
                    <th>Tier</th>
                    <th>Price</th>
                    <th>Note</th>
                    <th>Assigned</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(q => (
                    <tr key={q.refCode}>
                      <td><code className={styles.code}>{q.refCode}</code></td>
                      <td><span className={`${styles.tier} ${styles['tier' + q.tier]}`}>{q.tier}</span></td>
                      <td>${q.price.toLocaleString()}</td>
                      <td className={styles.noteCell}>{q.note || '—'}</td>
                      <td>{new Date(q.assignedAt).toLocaleDateString('en-AU')}</td>
                      <td className={styles.actions}>
                        <button className={styles.editBtn} onClick={() => handleEdit(q)}>Edit</button>
                        <button className={styles.deleteBtn} onClick={() => handleDelete(q.refCode)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
