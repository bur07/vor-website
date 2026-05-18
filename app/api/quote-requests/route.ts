import { listRequests, getRequest, deleteRequest } from '@/lib/edgeStore'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const ref = searchParams.get('ref')
    if (ref) {
      const request = await getRequest(ref.toUpperCase())
      return Response.json(request ?? null)
    }
    const requests = await listRequests()
    return Response.json(requests)
  } catch {
    return Response.json(null)
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
