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
  clientName?: string
  clientEmail?: string
  clientPhone?: string
  clientAddress?: string
  clientProperty?: string
  clientStoreys?: string
  clientInspection?: string
  clientArea?: string
  paidAt?: string
  amountPaid?: number
  paymentType?: string
}

const TIERS = ['Essential', 'Signature', 'Prestige']
const EMPTY_FORM = { refCode: '', tier: 'Essential', price: '', note: '', clientName: '', clientEmail: '', clientPhone: '', clientAddress: '' }

export default function AdminPanel() {
  const [authed, setAuthed]       = useState(false)
  const [pw, setPw]               = useState('')
  const [pwErr, setPwErr]         = useState('')
  const [quotes, setQuotes]       = useState<QuoteAssignment[]>([])
  const [requests, setRequests]   = useState<QuoteRequest[]>([])
  const [form, setForm]           = useState(EMPTY_FORM)
  const [pendingClient, setPendingClient] = useState<QuoteRequest | null>(null)
  const [editing, setEditing]     = useState<string | null>(null)
  const [flash, setFlash]         = useState('')
  const [expanded, setExpanded]   = useState<string | null>(null)
  const [saving, setSaving]       = useState(false)
  const [refClient, setRefClient] = useState<QuoteRequest | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  useEffect(() => {
    if (!authed) return
    Promise.all([
      fetch('/api/quote-requests').then(r => r.json()).catch(() => []),
      fetch('/api/quote-assignments').then(r => r.json()).catch(() => []),
    ]).then(([reqs, assigns]) => {
      setRequests(Array.isArray(reqs) ? reqs : [])
      setQuotes(Array.isArray(assigns) ? assigns : [])
    })
  }, [authed])

  const fetchRefClient = async (ref: string) => {
    const r = ref.trim().toUpperCase()
    if (!r) return
    try {
      const res = await fetch(`/api/quote-requests?ref=${encodeURIComponent(r)}`)
      const data = await res.json()
      setRefClient(data ?? null)
      if (data) {
        setForm(f => ({
          ...f,
          clientName:    f.clientName    || data.name    || '',
          clientEmail:   f.clientEmail   || data.email   || '',
          clientPhone:   f.clientPhone   || data.phone   || '',
          clientAddress: f.clientAddress || data.address || '',
        }))
      }
    } catch { setRefClient(null) }
  }

  const showFlash = (msg: string) => {
    setFlash(msg)
    setTimeout(() => setFlash(''), 3000)
  }

  const handleAssign = async () => {
    const ref = form.refCode.trim().toUpperCase()
    if (!ref || !form.price) { showFlash('Reference code and price are required.'); return }
    setSaving(true)
    // Always attempt to resolve client info — fetch from Edge Config if not already in memory
    let src: QuoteRequest | null = pendingClient ?? requests.find(r => r.refCode === ref) ?? refClient ?? null
    if (!src) {
      try {
        const res = await fetch(`/api/quote-requests?ref=${encodeURIComponent(ref)}`)
        const data = await res.json()
        if (data) src = data as QuoteRequest
      } catch {}
    }
    const prev = quotes.find(q => q.refCode === (editing ?? ref))
    const entry: QuoteAssignment = {
      refCode: ref,
      tier: form.tier,
      price: parseFloat(form.price),
      note: form.note.trim(),
      assignedAt: editing ? (prev?.assignedAt ?? new Date().toISOString()) : new Date().toISOString(),
      // Form fields take priority, then auto-fetched src, then previous assignment
      clientName:       form.clientName    || src?.name        || prev?.clientName,
      clientEmail:      form.clientEmail   || src?.email       || prev?.clientEmail,
      clientPhone:      form.clientPhone   || src?.phone       || prev?.clientPhone,
      clientAddress:    form.clientAddress || src?.address     || prev?.clientAddress,
      clientProperty:   src ? `${src.propertyType} — ${src.propertySize}` : prev?.clientProperty,
      clientStoreys:    src?.storeys     ?? prev?.clientStoreys,
      clientInspection: src ? `${src.inspectionDate} · ${src.inspectionTime}` : prev?.clientInspection,
      clientArea:       src?.serviceArea ?? prev?.clientArea,
    }
    try {
      const saveRes = await fetch('/api/quote-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      })
      if (!saveRes.ok) throw new Error(await saveRes.text())
      setQuotes(prev => {
        const without = prev.filter(q => q.refCode !== ref && q.refCode !== editing)
        return [entry, ...without].sort((a, b) =>
          new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
        )
      })
      // Auto-dismiss the incoming request if one matched
      if (src && requests.find(r => r.refCode === ref)) {
        await fetch('/api/quote-requests', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refCode: ref }),
        })
        setRequests(prev => prev.filter(r => r.refCode !== ref))
      }
      setForm(EMPTY_FORM)
      setEditing(null)
      setPendingClient(null)
      setRefClient(null)
      showFlash(`${ref} ${editing ? 'updated' : 'assigned'} successfully.`)
    } catch {
      showFlash('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (q: QuoteAssignment) => {
    setForm({
      refCode: q.refCode, tier: q.tier, price: String(q.price), note: q.note,
      clientName: q.clientName ?? '', clientEmail: q.clientEmail ?? '',
      clientPhone: q.clientPhone ?? '', clientAddress: q.clientAddress ?? '',
    })
    setEditing(q.refCode)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (ref: string) => {
    if (confirmDelete !== ref) { setConfirmDelete(ref); return }
    setConfirmDelete(null)
    try {
      const res = await fetch('/api/quote-assignments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refCode: ref }),
      })
      if (!res.ok) throw new Error(await res.text())
      setQuotes(prev => prev.filter(q => q.refCode !== ref))
      showFlash(`${ref} deleted.`)
    } catch (err) {
      showFlash(`Delete failed: ${err instanceof Error ? err.message : 'please try again'}`)
    }
  }

  const handleCancel = () => { setForm(EMPTY_FORM); setEditing(null); setPendingClient(null); setRefClient(null) }

  const handleAssignFromRequest = (r: QuoteRequest) => {
    setForm({
      refCode: r.refCode, tier: 'Essential', price: '', note: '',
      clientName: r.name, clientEmail: r.email,
      clientPhone: r.phone, clientAddress: r.address,
    })
    setPendingClient(r)
    setEditing(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

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

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <div className={styles.headerLogo}>VØR<span>.</span></div>
        <div className={styles.headerSub}>Quote Admin</div>
        <a href="/admin/confirm" className={styles.logoutBtn} style={{ textDecoration: 'none' }}>Send Confirmation</a>
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
                onChange={e => { setForm(f => ({ ...f, refCode: e.target.value.toUpperCase() })); setRefClient(null) }}
                onBlur={e => { if (!editing) void fetchRefClient(e.target.value) }}
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
            <hr className={styles.formDivider} />
            <div className={styles.field}>
              <label>Client Name</label>
              <input
                placeholder="Auto-filled from request"
                value={form.clientName}
                onChange={e => setForm(f => ({ ...f, clientName: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label>Client Email</label>
              <input
                placeholder="Auto-filled from request"
                value={form.clientEmail}
                onChange={e => setForm(f => ({ ...f, clientEmail: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label>Client Phone</label>
              <input
                placeholder="Auto-filled from request"
                value={form.clientPhone}
                onChange={e => setForm(f => ({ ...f, clientPhone: e.target.value }))}
              />
            </div>
            <div className={styles.field}>
              <label>Client Address</label>
              <input
                placeholder="Auto-filled from request"
                value={form.clientAddress}
                onChange={e => setForm(f => ({ ...f, clientAddress: e.target.value }))}
              />
            </div>
          </div>
          <div className={styles.formActions}>
            {editing && <button className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>}
            <button className={styles.assignBtn} onClick={handleAssign} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Update Quote' : 'Assign Quote'}
            </button>
          </div>
        </div>

        {/* ── Assigned list ──────────────────────────────── */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>
            Assigned Quotes <span className={styles.count}>{quotes.length}</span>
          </h2>
          {quotes.length === 0 ? (
            <p className={styles.empty}>No quotes assigned yet.</p>
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Ref Code</th>
                    <th>Tier</th>
                    <th>Price</th>
                    <th>Client Details</th>
                    <th>Assigned</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {quotes.map(q => (
                    <tr key={q.refCode}>
                      <td>
                        <code className={styles.code}>{q.refCode}</code>
                        {q.clientName && <div className={styles.clientName}>{q.clientName}</div>}
                      </td>
                      <td><span className={`${styles.tier} ${styles['tier' + q.tier]}`}>{q.tier}</span></td>
                      <td>
                        <div>${q.price.toLocaleString()}</div>
                        {q.paidAt && (
                          <div className={styles.paidBadge}>
                            PAID ${q.amountPaid?.toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td className={styles.noteCell}>
                        {q.clientEmail    && <div className={styles.clientDetail}>{q.clientEmail}</div>}
                        {q.clientPhone    && <div className={styles.clientDetail}>{q.clientPhone}</div>}
                        {q.clientAddress  && <div className={styles.clientDetail}>{q.clientAddress}</div>}
                        {q.clientProperty && <div className={styles.clientDetail}>{q.clientProperty}{q.clientStoreys ? ` · ${q.clientStoreys}` : ''}</div>}
                        {q.clientInspection && <div className={styles.clientDetail}>{q.clientInspection}</div>}
                        {q.note           && <div className={styles.clientNote}>{q.note}</div>}
                        {!q.clientEmail && !q.clientPhone && !q.clientAddress && !q.note && '—'}
                      </td>
                      <td>{new Date(q.assignedAt).toLocaleDateString('en-AU')}</td>
                      <td className={styles.actions}>
                        <button className={styles.editBtn} onClick={() => { setConfirmDelete(null); handleEdit(q) }}>Edit</button>
                        <button
                          className={confirmDelete === q.refCode ? styles.deleteBtnConfirm : styles.deleteBtn}
                          onClick={() => handleDelete(q.refCode)}
                          onBlur={() => setConfirmDelete(null)}
                        >
                          {confirmDelete === q.refCode ? 'Confirm?' : 'Delete'}
                        </button>
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
