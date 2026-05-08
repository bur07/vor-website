import { getResend, buildEmailHtml } from '@/lib/resend'
import type { ContactFormData } from '@/types'

export async function POST(req: Request) {
  try {
    const data: ContactFormData = await req.json()

    if (!data.firstName || !data.lastName || !data.email || !data.phone) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await getResend().emails.send({
      from: 'VØR Window Co. <onboarding@resend.dev>',
      to: process.env.TO_EMAIL ?? 'noahrylands@gmail.com',
      subject: `New consultation — ${data.firstName} ${data.lastName} · ${data.suburb || data.address}`,
      html: buildEmailHtml(data),
    })

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Contact route error:', err)
    return Response.json({ error: 'Failed to send' }, { status: 500 })
  }
}
