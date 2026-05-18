import { listAssignments, saveAssignment, deleteAssignment } from '@/lib/edgeStore'

export async function GET() {
  try {
    const assignments = await listAssignments()
    return Response.json(assignments)
  } catch {
    return Response.json([])
  }
}

export async function POST(req: Request) {
  try {
    const assignment = await req.json()
    await saveAssignment(assignment)
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { refCode } = await req.json()
    await deleteAssignment(refCode)
    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}
