import { listRequests, deleteRequest } from '@/lib/edgeStore'

export async function GET() {
  try {
    const requests = await listRequests()
    return Response.json(requests)
  } catch {
    return Response.json([])
  }
}

export async function DELETE(req: Request) {
  try {
    const { refCode } = await req.json()
    await deleteRequest(refCode)
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}
