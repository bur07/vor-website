import { Resend } from 'resend'
import { getAssignment, saveAssignment } from '@/lib/edgeStore'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: Request) {
  try {
    const { refCode, signature } = await req.json()
    if (!refCode || !signature) return Response.json({ error: 'Missing fields' }, { status: 400 })

    const existing = await getAssignment(String(refCode).toUpperCase())
    if (!existing) return Response.json({ error: 'Quote not found' }, { status: 404 })
    if (existing.clientSignedAt) return Response.json({ error: 'Already signed' }, { status: 409 })

    await saveAssignment({
      ...existing,
      clientSignedAt:  new Date().toISOString(),
      clientSignature: signature,
    })

    await resend.emails.send({
      from:    'VØR Window Co. <info@vorwindowco.com>',
      to:      'info@vorwindowco.com',
      subject: `Quote signed — ${existing.refCode}`,
      html:    `<p style="font-family:sans-serif"><strong>${existing.clientName ?? 'Client'}</strong> has accepted and signed quote <strong>${existing.refCode}</strong>.</p>`,
    }).catch(() => {})

    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
