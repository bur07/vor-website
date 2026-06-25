import { Resend } from 'resend'
import { sendAppointmentSms } from '@/lib/twilio'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = 'VØR Window Co. <info@vorwindowco.com>'

function fmtDate(iso: string) {
  const d = new Date(iso + 'T12:00:00')
  return d.toLocaleDateString('en-AU', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export async function POST(req: Request) {
  try {
    const secret = req.headers.get('x-admin-secret')
    if (secret !== process.env.ADMIN_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { refCode, name, email, phone, address, tier, date, time } = await req.json()
    if (!refCode || !name || !email || !date) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const prettyDate = fmtDate(date)

    const html = `<div style="background:#f5f0e8;font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a">
      <div style="background:#1B3A5C;padding:30px 40px">
        <h1 style="font-size:22px;font-weight:300;letter-spacing:0.25em;color:#f5f0e8;margin:0">VØR<span style="color:#c9a84c">.</span></h1>
        <p style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(245,240,232,0.55);margin:5px 0 0">Window Co.</p>
      </div>
      <div style="height:3px;background:#c9a84c"></div>
      <div style="padding:36px 40px">
        <p style="font-size:15px;line-height:1.8;color:#2c2c2c;margin:0 0 8px">Hi ${name},</p>
        <p style="font-size:14px;line-height:1.9;color:#5a4a2a;margin:0 0 28px">Your appointment has been scheduled. We look forward to seeing you.</p>
        <div style="background:#c9a84c;padding:14px 20px;margin:0 0 24px;display:flex;justify-content:space-between;align-items:center">
          <div>
            <div style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.8);margin-bottom:4px">Appointment</div>
            <div style="font-size:18px;font-weight:700;color:#fff">${prettyDate}</div>
            ${time ? `<div style="font-size:13px;color:rgba(255,255,255,0.9);margin-top:3px">${time}</div>` : ''}
          </div>
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
        <p style="font-size:13px;line-height:1.8;color:#5a4a2a;margin:0 0 20px">Need to reschedule? Contact us and we'll sort it out.</p>
        <p style="font-size:12px;color:#8a7a5a;margin:0">
          <a href="tel:+61416572468" style="color:#c9a84c;text-decoration:none">0416 572 468</a> ·
          <a href="mailto:info@vorwindowco.com" style="color:#c9a84c;text-decoration:none">info@vorwindowco.com</a>
        </p>
      </div>
      <div style="background:#1B3A5C;padding:18px 40px;font-size:11px;color:rgba(245,240,232,0.45);letter-spacing:0.1em">
        VØR Window Co. · Sydney &amp; ACT · vorwindowco.com
      </div>
    </div>`

    await resend.emails.send({
      from:    FROM,
      to:      email,
      bcc:     'info@vorwindowco.com',
      subject: `Appointment confirmed — ${prettyDate}`,
      html,
    })

    if (phone) {
      await sendAppointmentSms({ name, phone, tier, date: prettyDate, time: time ?? '', refCode }).catch(() => {})
    }

    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
