import { getResend, buildEmailHtml, buildClientConfirmationHtml } from '@/lib/resend'
import { sendClientSms } from '@/lib/twilio'
import type { ContactFormData } from '@/types'

export async function POST(req: Request) {
  try {
    const data: ContactFormData = await req.json()

    if (!data.firstName || !data.lastName || !data.email || !data.phone) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const resend = getResend()
    const ref = `VOR-${Date.now().toString(36).toUpperCase()}`

    // Noah's notification — required
    const ownerResult = await resend.emails.send({
      from: 'VØR Window Co. <hello@vorwindowco.com>',
      to: process.env.TO_EMAIL ?? 'info@vorwindowco.com',
      subject: `[${ref}] New consultation — ${data.firstName} ${data.lastName} · ${data.suburb || data.address}`,
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
      subject: `[${ref}] Your VØR consultation request — we'll be in touch shortly`,
      html: buildClientConfirmationHtml(data),
    })

    if (clientResult.error) {
      console.error('Client confirmation email failed:', clientResult.error)
    }

    // SMS confirmation — best-effort, silently skipped if Twilio not configured
    try {
      await sendClientSms(data)
    } catch (err) {
      console.error('Client SMS failed:', err)
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Contact route error:', err)
    return Response.json({ error: 'Failed to send' }, { status: 500 })
  }
}
