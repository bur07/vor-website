import { Resend } from 'resend'
import { listAssignments, saveAssignment } from '@/lib/edgeStore'
import { sendReminderSms } from '@/lib/twilio'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = 'VØR Window Co. <info@vorwindowco.com>'

function tomorrowAEST(): string {
  // AEST is UTC+10. Add 10h to get local time, then advance one day.
  const aestNow  = new Date(Date.now() + 10 * 60 * 60 * 1000)
  const tomorrow = new Date(aestNow.getTime() + 24 * 60 * 60 * 1000)
  return tomorrow.toISOString().slice(0, 10)
}

function prettyDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function reminderEmail(opts: {
  name: string; refCode: string; tier: string
  date: string; time: string; address: string
}) {
  const { name, refCode, tier, date, time, address } = opts
  return `<div style="background:#f5f0e8;font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a">
  <div style="background:#1B3A5C;padding:30px 40px">
    <h1 style="font-size:22px;font-weight:300;letter-spacing:0.25em;color:#f5f0e8;margin:0">VØR<span style="color:#c9a84c">.</span></h1>
    <p style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(245,240,232,0.55);margin:5px 0 0">Window Co.</p>
  </div>
  <div style="height:3px;background:#c9a84c"></div>
  <div style="padding:36px 40px">
    <p style="font-size:15px;line-height:1.8;color:#2c2c2c;margin:0 0 8px">Hi ${name},</p>
    <p style="font-size:14px;line-height:1.9;color:#5a4a2a;margin:0 0 28px">Just a reminder — your window clean is <strong>tomorrow</strong>. We look forward to seeing you.</p>
    <div style="background:#c9a84c;padding:14px 20px;margin:0 0 24px">
      <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.8);margin-bottom:4px">Tomorrow's Appointment</div>
      <div style="font-size:18px;font-weight:700;color:#fff">${prettyDate(date)}</div>
      ${time ? `<div style="font-size:13px;color:rgba(255,255,255,0.9);margin-top:3px">${time}</div>` : ''}
    </div>
    <div style="border-left:3px solid #c9a84c;margin:0 0 24px">
      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:9px 0 9px 16px;font-size:11px;letter-spacing:0.13em;text-transform:uppercase;color:#8a7a5a;width:42%;border-bottom:1px solid rgba(201,168,76,0.2)">Reference</td>
          <td style="padding:9px 0;font-size:13px;color:#2c2c2c;border-bottom:1px solid rgba(201,168,76,0.2)">${refCode}</td>
        </tr>
        <tr>
          <td style="padding:9px 0 9px 16px;font-size:11px;letter-spacing:0.13em;text-transform:uppercase;color:#8a7a5a;border-bottom:1px solid rgba(201,168,76,0.2)">Service</td>
          <td style="padding:9px 0;font-size:13px;color:#2c2c2c;border-bottom:1px solid rgba(201,168,76,0.2)">${tier}</td>
        </tr>
        ${address ? `<tr>
          <td style="padding:9px 0 9px 16px;font-size:11px;letter-spacing:0.13em;text-transform:uppercase;color:#8a7a5a">Property</td>
          <td style="padding:9px 0;font-size:13px;color:#2c2c2c">${address}</td>
        </tr>` : ''}
      </table>
    </div>
    <p style="font-size:13px;line-height:1.8;color:#5a4a2a;margin:0 0 8px">Need to reschedule? Reach out and we'll sort it out.</p>
    <p style="font-size:12px;color:#8a7a5a;margin:0">
      <a href="tel:+61416572468" style="color:#c9a84c;text-decoration:none">0416 572 468</a> ·
      <a href="mailto:info@vorwindowco.com" style="color:#c9a84c;text-decoration:none">info@vorwindowco.com</a>
    </p>
  </div>
  <div style="background:#1B3A5C;padding:18px 40px;font-size:11px;color:rgba(245,240,232,0.45);letter-spacing:0.1em">
    VØR Window Co. · Sydney &amp; ACT · vorwindowco.com
  </div>
</div>`
}

export async function GET(req: Request) {
  // Vercel passes CRON_SECRET as Bearer token — skip check in dev
  const secret = process.env.CRON_SECRET
  if (secret) {
    const auth = req.headers.get('authorization')
    if (auth !== `Bearer ${secret}`) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const tomorrow = tomorrowAEST()
  const all = await listAssignments()

  const due = all.filter(a =>
    a.appointmentDate === tomorrow &&
    !a.cancelledAt &&
    !a.jobFinishedAt &&
    !a.reminderSentAt
  )

  const results: { refCode: string; sms: boolean; email: boolean }[] = []

  for (const a of due) {
    let sms = false, email = false
    const date   = prettyDate(a.appointmentDate!)
    const time   = a.appointmentTime ?? ''
    const name   = a.clientName ?? 'there'
    const addr   = a.clientAddress ?? ''

    if (a.clientPhone) {
      try {
        await sendReminderSms({ name, phone: a.clientPhone, tier: a.tier, date, time, address: addr })
        sms = true
      } catch { /* keep going */ }
    }

    if (a.clientEmail) {
      try {
        await resend.emails.send({
          from:    FROM,
          to:      a.clientEmail,
          subject: `Reminder — your window clean is tomorrow`,
          html:    reminderEmail({ name, refCode: a.refCode, tier: a.tier, date: a.appointmentDate!, time, address: addr }),
        })
        email = true
      } catch { /* keep going */ }
    }

    if (sms || email) {
      await saveAssignment({ ...a, reminderSentAt: new Date().toISOString() })
    }

    results.push({ refCode: a.refCode, sms, email })
  }

  return Response.json({ ok: true, tomorrow, sent: results.length, results })
}
