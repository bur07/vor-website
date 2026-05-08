import { getResend, buildEmailHtml, buildClientConfirmationHtml } from '@/lib/resend'
import type { ContactFormData } from '@/types'

export async function POST(req: Request) {
  try {
    const data: ContactFormData = await req.json()

    if (!data.firstName || !data.lastName || !data.email || !data.phone) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const resend = getResend()

    await Promise.all([
      resend.emails.send({
        from: 'VØR Window Co. <onboarding@resend.dev>',
        to: process.env.TO_EMAIL ?? 'noahrylands@gmail.com',
        subject: `New consultation — ${data.firstName} ${data.lastName} · ${data.suburb || data.address}`,
        html: buildEmailHtml(data),
      }),
      resend.emails.send({
        from: 'VØR Window Co. <onboarding@resend.dev>',
        to: data.email,
        subject: `Your VØR consultation request — we'll be in touch shortly`,
        html: buildClientConfirmationHtml(data),
      }),
    ])

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Contact route error:', err)
    return Response.json({ error: 'Failed to send' }, { status: 500 })
  }
}
