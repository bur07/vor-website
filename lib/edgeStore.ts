// Thin wrapper around Vercel Edge Config for storing quote requests.
// Reads via the public Edge Config endpoint; writes via the Vercel management API.

const EC_ID    = process.env.EDGE_CONFIG_ID!
const EC_TOKEN = (() => {
  const raw = process.env.EDGE_CONFIG ?? ''
  const m = raw.match(/token=([^&]+)/)
  return m ? m[1] : ''
})()
const API_TOKEN = process.env.VERCEL_API_TOKEN!
const TEAM_ID   = process.env.VERCEL_TEAM_ID!

const READ_BASE  = `https://edge-config.vercel.com/${EC_ID}`
const WRITE_URL  = `https://api.vercel.com/v1/edge-config/${EC_ID}/items?teamId=${TEAM_ID}`

// ── helpers ────────────────────────────────────────────────

async function ecGet<T>(key: string): Promise<T | null> {
  try {
    const r = await fetch(`${READ_BASE}/item/${encodeURIComponent(key)}?token=${EC_TOKEN}`)
    if (r.status === 404) return null
    const j = await r.json()
    return j as T
  } catch { return null }
}

// Single atomic PATCH — index update + item upsert/delete in one request
async function ecPatch(items: { operation: 'upsert' | 'delete'; key: string; value?: unknown }[]) {
  const res = await fetch(WRITE_URL, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.status.toString())
    throw new Error(`Edge Config write failed (${res.status}): ${text}`)
  }
}

// ── public API ─────────────────────────────────────────────

export interface QuoteRequest {
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

export async function getRequest(refCode: string): Promise<QuoteRequest | null> {
  return ecGet<QuoteRequest>(`req_${refCode}`)
}

export async function saveRequest(req: QuoteRequest) {
  const index = (await ecGet<string[]>('_index')) ?? []
  const newIndex = index.includes(req.refCode) ? index : [...index, req.refCode]
  await ecPatch([
    { operation: 'upsert', key: '_index',              value: newIndex },
    { operation: 'upsert', key: `req_${req.refCode}`,  value: req },
  ])
}

export async function listRequests(): Promise<QuoteRequest[]> {
  const index = (await ecGet<string[]>('_index')) ?? []
  if (!index.length) return []
  const items = await Promise.all(index.map(ref => ecGet<QuoteRequest>(`req_${ref}`)))
  return (items.filter(Boolean) as QuoteRequest[])
    .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
}

export async function deleteRequest(refCode: string) {
  const index = (await ecGet<string[]>('_index')) ?? []
  await ecPatch([
    { operation: 'upsert', key: '_index',             value: index.filter(r => r !== refCode) },
    { operation: 'delete', key: `req_${refCode}` },
  ])
}

// ── Assignments ────────────────────────────────────────────

export interface QuoteAssignment {
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
}

export async function saveAssignment(a: QuoteAssignment) {
  const index = (await ecGet<string[]>('_assign_index')) ?? []
  const newIndex = index.includes(a.refCode) ? index : [...index, a.refCode]
  await ecPatch([
    { operation: 'upsert', key: '_assign_index',        value: newIndex },
    { operation: 'upsert', key: `assign_${a.refCode}`,  value: a },
  ])
}

export async function getAssignment(refCode: string): Promise<QuoteAssignment | null> {
  return ecGet<QuoteAssignment>(`assign_${refCode}`)
}

export async function listAssignments(): Promise<QuoteAssignment[]> {
  const index = (await ecGet<string[]>('_assign_index')) ?? []
  if (!index.length) return []
  const items = await Promise.all(index.map(ref => ecGet<QuoteAssignment>(`assign_${ref}`)))
  return (items.filter(Boolean) as QuoteAssignment[])
    .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime())
}

export async function deleteAssignment(refCode: string) {
  const index = (await ecGet<string[]>('_assign_index')) ?? []
  await ecPatch([
    { operation: 'upsert', key: '_assign_index',       value: index.filter(r => r !== refCode) },
    { operation: 'delete', key: `assign_${refCode}` },
  ])
}
