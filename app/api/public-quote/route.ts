import { getAssignment } from '@/lib/edgeStore'

export async function GET(req: Request) {
  const ref = new URL(req.url).searchParams.get('ref')
  if (!ref) return Response.json({ error: 'Missing ref' }, { status: 400 })

  const a = await getAssignment(ref.toUpperCase())
  if (!a) return Response.json({ error: 'Not found' }, { status: 404 })

  return Response.json({
    refCode:         a.refCode,
    tier:            a.tier,
    price:           a.price,
    note:            a.note,
    assignedAt:      a.assignedAt,
    clientName:      a.clientName,
    clientSignedAt:  a.clientSignedAt,
    clientSignature: a.clientSignature,
    quoteValidUntil: a.quoteValidUntil,
  })
}
