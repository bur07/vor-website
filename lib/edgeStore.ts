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

async function ecSet(key: string, value: unknown) {
  await fetch(WRITE_URL, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items: [{ operation: 'upsert', key, value }] }),
  })
}

async function ecDel(key: string) {
  await fetch(WRITE_URL, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ items: [{ operation: 'delete', key }] }),
  })
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

export async function saveRequest(req: QuoteRequest) {
  const index = (await ecGet<string[]>('_index')) ?? []
  if (!index.includes(req.refCode)) {
    await ecSet('_index', [...index, req.refCode])
  }
  await ecSet(`req_${req.refCode}`, req)
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
  await ecSet('_index', index.filter(r => r !== refCode))
  await ecDel(`req_${refCode}`)
}
