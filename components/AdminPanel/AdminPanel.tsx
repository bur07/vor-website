'use client'

import { useState, useEffect } from 'react'
import styles from './AdminPanel.module.css'

interface QuoteRequest {
  refCode: string
  name: string
  email: string
  phone: string
  address: string
  propertyType: string
  propertySize: string
  storeys: string
  inspectionDate: string
  inspectionTime: string
  serviceArea: string
  specialRequirements: string
  submittedAt: string
}

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
  const [authed, setAuthed]       = useState(false)
  const [pw, setPw]               = useState('')
  const [pwErr, setPwErr]         = useState('')
  const [quotes, setQuotes]       = useState<Record<string, QuoteAssignment>>({})
  const [requests, setRequests]   = useState<QuoteRequest[]>([])
  const [form, setForm]           = useState(EMPTY_FORM)
  const [editing, setEditing]     = useState<string | null>(null)
  const [flash, setFlash]         = useState('')
  const [expanded, setExpanded]   = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('vor_quotes')
      if (stored) setQuotes(JSON.parse(stored))
    } catch {}
  }, [])

  useEffect(() => {
    if (!authed) return
    fetch('/api/quote-requests')
      .then(r => r.json())
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .catch(() => {})
  }, [authed])

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

  // Pre-fill assign form from an incoming request
  const handleAssignFromRequest = (r: QuoteRequest) => {
    setForm({ refCode: r.refCode, tier: 'Essential', price: '', note: '' })
    setEditing(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Dismiss a request once dealt with
  const handleDismiss = async (refCode: string) => {
    await fetch('/api/quote-requests', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refCode }),
    })
    setRequests(prev => prev.filter(r => r.refCode !== refCode))
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

        {/* ── Incoming requests ─────────────────────────── */}
        {requests.length > 0 && (
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              Incoming Requests <span className={styles.countNew}>{requests.length}</span>
            </h2>
            <div className={styles.requestList}>
              {requests.map(r => (
                <div key={r.refCode} className={styles.requestRow}>
                  <div className={styles.requestTop}>
                    <div className={styles.requestMeta}>
                      <code className={styles.code}>{r.refCode}</code>
                      <span className={styles.requestName}>{r.name}</span>
                      <span className={styles.requestDate}>
                        {new Date(r.submittedAt).toLocaleDateString('en-AU')}
                      </span>
                    </div>
                    <div className={styles.requestActions}>
                      <button
                        className={styles.expandBtn}
                        onClick={() => setExpanded(expanded === r.refCode ? null : r.refCode)}
                      >
                        {expanded === r.refCode ? 'Hide' : 'View Info'}
                      </button>
                      <button
                        className={styles.assignFromBtn}
                        onClick={() => handleAssignFromRequest(r)}
                      >
                        Assign Quote ↓
                      </button>
                      <button
                        className={styles.dismissBtn}
                        onClick={() => handleDismiss(r.refCode)}
                      >
                        Dismiss
                      </button>
                    </div>
                  </div>

                  {expanded === r.refCode && (
                    <div className={styles.requestDetail}>
                      <div className={styles.detailGrid}>
                        <div className={styles.detailItem}><span>Email</span><strong>{r.email}</strong></div>
                        <div className={styles.detailItem}><span>Phone</span><strong>{r.phone}</strong></div>
                        <div className={styles.detailItem}><span>Address</span><strong>{r.address}</strong></div>
                        <div className={styles.detailItem}><span>Property</span><strong>{r.propertyType} — {r.propertySize}</strong></div>
                        <div className={styles.detailItem}><span>Storeys</span><strong>{r.storeys}</strong></div>
                        <div className={styles.detailItem}><span>Area</span><strong>{r.serviceArea}</strong></div>
                        <div className={styles.detailItem}><span>Inspection</span><strong>{r.inspectionDate} · {r.inspectionTime}</strong></div>
                        {r.specialRequirements && (
                          <div className={`${styles.detailItem} ${styles.detailFull}`}>
                            <span>Requirements</span><strong>{r.specialRequirements}</strong>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Assign form ────────────────────────────────── */}
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

        {/* ── Assigned list ──────────────────────────────── */}
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
                  {sorted.map(q => {
                    const req = requests.find(r => r.refCode === q.refCode)
                    return (
                      <tr key={q.refCode}>
                        <td>
                          <code className={styles.code}>{q.refCode}</code>
                          {req && <div className={styles.clientName}>{req.name}</div>}
                        </td>
                        <td><span className={`${styles.tier} ${styles['tier' + q.tier]}`}>{q.tier}</span></td>
                        <td>${q.price.toLocaleString()}</td>
                        <td className={styles.noteCell}>{q.note || '—'}</td>
                        <td>{new Date(q.assignedAt).toLocaleDateString('en-AU')}</td>
                        <td className={styles.actions}>
                          <button className={styles.editBtn} onClick={() => handleEdit(q)}>Edit</button>
                          <button className={styles.deleteBtn} onClick={() => handleDelete(q.refCode)}>Delete</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
