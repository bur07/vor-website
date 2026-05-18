import { kv } from '@vercel/kv'

export async function GET() {
  try {
    const keys = await kv.keys('req:*')
    if (!keys.length) return Response.json([])
    const requests = await Promise.all(keys.map(k => kv.get(k)))
    const sorted = (requests.filter(Boolean) as Record<string, string>[])
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
    return Response.json(sorted)
  } catch {
    return Response.json([])
  }
}

export async function DELETE(req: Request) {
  try {
    const { refCode } = await req.json()
    await kv.del(`req:${refCode}`)
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}
