import { Resend } from 'resend'
import { sendBookingConfirmedSms } from '@/lib/twilio'
import { addToCalendar } from '@/lib/googleCalendar'

const FROM = 'VØR Window Co. <info@vorwindowco.com>'
const BUSINESS_EMAIL = 'info@vorwindowco.com'

function row(label: string, value: string) {
  return `<tr>
    <td style="padding:9px 0 9px 16px;font-size:11px;letter-spacing:0.13em;text-transform:uppercase;color:#8a7a5a;width:42%;border-bottom:1px solid rgba(201,168,76,0.2)">${label}</td>
    <td style="padding:9px 0;font-size:13px;color:#2c2c2c;border-bottom:1px solid rgba(201,168,76,0.2)">${value || '—'}</td>
  </tr>`
}

export async function POST(req: Request) {
  try {
    const d = await req.json()
    const { refCode, name, email, phone, address, tier, price, paymentType, amountPaid, balanceDue, date, time, note } = d

    if (!refCode || !name || (!email && !phone)) {
      return Response.json({ error: 'Missing required fields — need at least email or phone' }, { status: 400 })
    }

    const clientHtml = `<div style="background:#f5f0e8;font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a">
      <div style="background:#1B3A5C;padding:30px 40px">
        <h1 style="font-size:22px;font-weight:300;letter-spacing:0.25em;color:#f5f0e8;margin:0">VØR<span style="color:#c9a84c">.</span></h1>
        <p style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(245,240,232,0.55);margin:5px 0 0">Window Co.</p>
      </div>
      <div style="padding:36px 40px">
        <p style="font-size:15px;line-height:1.8;color:#2c2c2c;margin:0 0 10px">Hi ${name},</p>
        <p style="font-size:14px;line-height:1.9;color:#5a4a2a;margin:0 0 24px">Your booking is confirmed. Here's a full summary for your records.</p>
        <div style="background:#c9a84c;padding:18px;text-align:center;margin:0 0 24px">
          <p style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.85);margin:0 0 6px">Booking Reference</p>
          <p style="font-size:28px;font-weight:700;letter-spacing:0.2em;color:#fff;margin:0">${refCode}</p>
        </div>
        <div style="border-left:3px solid #c9a84c;margin:0 0 24px">
          <table style="width:100%;border-collapse:collapse">
            ${address ? row('Property', address) : ''}
            ${row('Service', tier)}
            ${row('Appointment', `${date} · ${time}`)}
            ${row('Total Price', `$${price} AUD`)}
            ${row('Payment', paymentType)}
            ${row('Amount Paid', `$${amountPaid} AUD`)}
            ${Number(balanceDue) > 0 ? row('Balance Due on Day', `$${balanceDue} AUD`) : ''}
            ${note ? row('Note', note) : ''}
          </table>
        </div>
        <p style="font-size:13px;line-height:1.8;color:#5a4a2a;margin:0 0 20px">Noah will be in touch to confirm your exact appointment time. Reply to this email or call if you need any changes.</p>
        <p style="font-size:12px;color:#8a7a5a;margin:0">
          <a href="tel:+61416572468" style="color:#c9a84c;text-decoration:none">0416 572 468</a> ·
          <a href="mailto:info@vorwindowco.com" style="color:#c9a84c;text-decoration:none">info@vorwindowco.com</a>
        </p>
      </div>
      <div style="background:#2c1f0e;padding:18px 40px;font-size:11px;color:rgba(245,240,232,0.45);letter-spacing:0.1em">
        VØR Window Co. · Sydney &amp; ACT · vorwindowco.com
      </div>
    </div>`

    const bizHtml = `<div style="font-family:Georgia,serif;max-width:620px;margin:0 auto;padding:40px 32px;background:#FAF6EE;color:#0E1E30">
      <div style="border-bottom:1px solid #B8D5EF;padding-bottom:20px;margin-bottom:28px">
        <h1 style="font-size:26px;font-weight:300;letter-spacing:0.2em;color:#1B3A5C;margin:0">VØR<span style="color:#2A5FA5">.</span></h1>
        <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#6A8296;margin:6px 0 0">Manual Booking Confirmation — ${refCode}</p>
      </div>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:8px 0;border-bottom:1px solid rgba(42,95,165,0.08);font-size:11px;letter-spacing:0.13em;text-transform:uppercase;color:#6A8296;width:38%">Reference</td><td style="padding:8px 0;border-bottom:1px solid rgba(42,95,165,0.08);font-size:13px;color:#0E1E30"><strong>${refCode}</strong></td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid rgba(42,95,165,0.08);font-size:11px;letter-spacing:0.13em;text-transform:uppercase;color:#6A8296">Name</td><td style="padding:8px 0;border-bottom:1px solid rgba(42,95,165,0.08);font-size:13px;color:#0E1E30">${name}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid rgba(42,95,165,0.08);font-size:11px;letter-spacing:0.13em;text-transform:uppercase;color:#6A8296">Email</td><td style="padding:8px 0;border-bottom:1px solid rgba(42,95,165,0.08);font-size:13px;color:#0E1E30">${email}</td></tr>
        ${address ? `<tr><td style="padding:8px 0;border-bottom:1px solid rgba(42,95,165,0.08);font-size:11px;letter-spacing:0.13em;text-transform:uppercase;color:#6A8296">Address</td><td style="padding:8px 0;border-bottom:1px solid rgba(42,95,165,0.08);font-size:13px;color:#0E1E30">${address}</td></tr>` : ''}
        <tr><td style="padding:8px 0;border-bottom:1px solid rgba(42,95,165,0.08);font-size:11px;letter-spacing:0.13em;text-transform:uppercase;color:#6A8296">Tier</td><td style="padding:8px 0;border-bottom:1px solid rgba(42,95,165,0.08);font-size:13px;color:#0E1E30">${tier}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid rgba(42,95,165,0.08);font-size:11px;letter-spacing:0.13em;text-transform:uppercase;color:#6A8296">Price</td><td style="padding:8px 0;border-bottom:1px solid rgba(42,95,165,0.08);font-size:13px;color:#0E1E30"><strong>$${price} AUD</strong></td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid rgba(42,95,165,0.08);font-size:11px;letter-spacing:0.13em;text-transform:uppercase;color:#6A8296">Date</td><td style="padding:8px 0;border-bottom:1px solid rgba(42,95,165,0.08);font-size:13px;color:#0E1E30">${date} · ${time}</td></tr>
        <tr><td style="padding:8px 0;border-bottom:1px solid rgba(42,95,165,0.08);font-size:11px;letter-spacing:0.13em;text-transform:uppercase;color:#6A8296">Payment</td><td style="padding:8px 0;border-bottom:1px solid rgba(42,95,165,0.08);font-size:13px;color:#0E1E30">${paymentType} — $${amountPaid} AUD paid</td></tr>
      </table>
      <div style="margin-top:36px;padding-top:20px;border-top:1px solid #B8D5EF;font-size:11px;color:#6A8296">
        VØR Window Co. · Sent manually from admin panel
      </div>
    </div>`

    const sends: Promise<unknown>[] = []

    if (email) {
      const resend = new Resend(process.env.RESEND_API_KEY)
      sends.push(
        resend.emails.send({
          from: FROM, to: email, replyTo: BUSINESS_EMAIL,
          subject: `[${refCode}] Your VØR booking is confirmed`,
          html: clientHtml,
        }),
        resend.emails.send({
          from: FROM, to: BUSINESS_EMAIL, replyTo: email,
          subject: `[${refCode}] Booking confirmed (manual) — ${name}`,
          html: bizHtml,
        }),
      )
    } else {
      // No client email — still notify the business without a replyTo
      const resend = new Resend(process.env.RESEND_API_KEY)
      sends.push(
        resend.emails.send({
          from: FROM, to: BUSINESS_EMAIL,
          subject: `[${refCode}] Booking confirmed (manual) — ${name}`,
          html: bizHtml,
        }),
      )
    }

    if (phone) {
      sends.push(
        sendBookingConfirmedSms({ name, phone, refCode, tier, date, time, amountPaid: String(amountPaid), balanceDue: String(balanceDue) })
          .catch(() => {})
      )
    }

    await Promise.all(sends)

    addToCalendar({ refCode, name, address, tier, price, date, time, note }).catch(() => {})

    return Response.json({ ok: true })
  } catch (err) {
    console.error('send-confirmation error:', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
