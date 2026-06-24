const BASE  = (process.env.UPSTASH_REDIS_REST_URL  ?? process.env.KV_REST_API_URL)!
const TOKEN = (process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN)!
const headers = () => ({ Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' })

async function ecGet<T>(key: string): Promise<T | null> {
  try {
    const r = await fetch(`${BASE}/get/${encodeURIComponent(key)}`, { headers: headers(), cache: 'no-store' })
    const j = await r.json()
    if (j.result === null || j.result === undefined) return null
    return JSON.parse(j.result) as T
  } catch { return null }
}

async function ecPatch(items: { operation: 'upsert' | 'delete'; key: string; value?: unknown }[]) {
  const commands = items.map(item =>
    item.operation === 'upsert'
      ? ['SET', item.key, JSON.stringify(item.value)]
      : ['DEL', item.key]
  )
  const res = await fetch(`${BASE}/pipeline`, {
    method: 'POST', headers: headers(), body: JSON.stringify(commands),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => res.status.toString())
    throw new Error(`Redis write failed (${res.status}): ${text}`)
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
    { operation: 'upsert', key: '_index',             value: newIndex },
    { operation: 'upsert', key: `req_${req.refCode}`, value: req },
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
    { operation: 'upsert', key: '_index', value: index.filter(r => r !== refCode) },
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
  paidAt?: string
  amountPaid?: number
  paymentType?: string
  appointmentDate?: string
  appointmentTime?: string
  jobStartedAt?: string
  jobFinishedAt?: string
  jobDurationMins?: number
  jobStartLat?: number
  jobStartLng?: number
  jobFinishLat?: number
  jobFinishLng?: number
  smsSentAt?: string
  cancelledAt?: string
  stripePayUrl?: string
  clientSignedAt?: string
  clientSignature?: string
  reminderSentAt?: string
  followUpSentAt?: string
  accessNote?: string
  quoteValidUntil?: string
}

export async function saveAssignment(a: QuoteAssignment) {
  const index = (await ecGet<string[]>('_assign_index')) ?? []
  const newIndex = index.includes(a.refCode) ? index : [...index, a.refCode]
  await ecPatch([
    { operation: 'upsert', key: '_assign_index',       value: newIndex },
    { operation: 'upsert', key: `assign_${a.refCode}`, value: a },
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
    { operation: 'upsert', key: '_assign_index', value: index.filter(r => r !== refCode) },
  ])
}
