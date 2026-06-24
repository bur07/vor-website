import { getAssignment } from '@/lib/edgeStore'
import { NextRequest } from 'next/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ refCode: string }> }
) {
  const { refCode } = await params
  const assignment = await getAssignment(refCode)

  if (!assignment?.stripePayUrl) {
    return Response.redirect('https://vorwindowco.com', 302)
  }

  return Response.redirect(assignment.stripePayUrl, 302)
}
