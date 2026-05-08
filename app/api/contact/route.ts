import { getResend, buildEmailHtml, buildClientConfirmationHtml } from '@/lib/resend'
import type { ContactFormData } from '@/types'

export async function POST(req: Request) {
  try {
    const data: ContactFormData = await req.json()

    if (!data.firstName || !data.lastName || !data.email || !data.phone) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const resend = getResend()

    // Noah's notification — required
    const ownerResult = await resend.emails.send({
      from: 'VØR Window Co. <hello@vorwindowco.com>',
      to: process.env.TO_EMAIL ?? 'noahrylands@gmail.com',
      subject: `New consultation — ${data.firstName} ${data.lastName} · ${data.suburb || data.address}`,
      html: buildEmailHtml(data),
    })

    if (ownerResult.error) {
      console.error('Owner email failed:', ownerResult.error)
      return Response.json({ error: 'Failed to send' }, { status: 500 })
    }

    // Client confirmation — best-effort (requires verified sending domain)
    const clientResult = await resend.emails.send({
      from: 'VØR Window Co. <hello@vorwindowco.com>',
      to: data.email,
      subject: `Your VØR consultation request — we'll be in touch shortly`,
      html: buildClientConfirmationHtml(data),
    })

    if (clientResult.error) {
      console.error('Client confirmation email failed:', clientResult.error)
      // Don't fail the request — Noah's email already sent
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Contact route error:', err)
    return Response.json({ error: 'Failed to send' }, { status: 500 })
  }
}
