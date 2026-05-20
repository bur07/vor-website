import { listAssignments, getAssignment, saveAssignment, deleteAssignment } from '@/lib/edgeStore'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const ref = searchParams.get('ref')
    if (ref) {
      const assignment = await getAssignment(ref.toUpperCase())
      return Response.json(assignment ?? null)
    }
    const assignments = await listAssignments()
    return Response.json(assignments)
  } catch {
    return Response.json(null)
  }
}

export async function POST(req: Request) {
  try {
    const assignment = await req.json()
    await saveAssignment(assignment)
    return Response.json({ ok: true })
  } catch (err) {
    console.error('saveAssignment error:', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { refCode } = await req.json()
    await deleteAssignment(refCode)
    return Response.json({ ok: true })
  } catch (err) {
    console.error('deleteAssignment error:', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
