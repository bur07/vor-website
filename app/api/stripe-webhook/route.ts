import Stripe from 'stripe'
import { Resend } from 'resend'
import { sendBookingConfirmedSms } from '@/lib/twilio'
import { getAssignment, saveAssignment } from '@/lib/edgeStore'
import { addToCalendar } from '@/lib/googleCalendar'

const FROM = 'VØR Window Co. <info@vorwindowco.com>'
const BUSINESS_EMAIL = 'info@vorwindowco.com'

function clientRow(label: string, value: string) {
  return `<tr>
    <td style="padding:9px 0 9px 16px;font-size:11px;letter-spacing:0.13em;text-transform:uppercase;color:#8a7a5a;width:42%;border-bottom:1px solid rgba(201,168,76,0.2)">${label}</td>
    <td style="padding:9px 0;font-size:13px;color:#2c2c2c;border-bottom:1px solid rgba(201,168,76,0.2)">${value || '—'}</td>
  </tr>`
}
function bizRow(label: string, value: string) {
  return `<tr>
    <td style="padding:9px 0;border-bottom:1px solid rgba(42,95,165,0.08);font-size:11px;letter-spacing:0.13em;text-transform:uppercase;color:#6A8296;width:38%;vertical-align:top">${label}</td>
    <td style="padding:9px 0;border-bottom:1px solid rgba(42,95,165,0.08);font-size:13px;color:#0E1E30">${value || '—'}</td>
  </tr>`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function sendBookingEmails(m: Record<string, string>, paymentId: string) {
  const resend = new Resend(process.env.RESEND_API_KEY)

  const bizRows = [
    bizRow('Reference',      `<strong>${m.refCode}</strong>`),
    bizRow('Payment ID',     paymentId),
    bizRow('Name',           m.name),
    bizRow('Email',          m.email),
    bizRow('Phone',          m.phone),
    bizRow('Service Tier',   m.tier),
    bizRow('Total Price',    `$${m.price} AUD`),
    bizRow('Payment Type',   m.paymentType),
    bizRow('Amount Paid',    `$${m.amountPaid} AUD`),
    bizRow('Balance Due',    `$${m.balanceDue} AUD`),
    bizRow('Date',           m.date),
    bizRow('Time',           m.time),
    m.note ? bizRow('Note', m.note) : '',
  ].join('')

  const bizHtml = `<div style="font-family:Georgia,serif;max-width:620px;margin:0 auto;padding:40px 32px;background:#FAF6EE;color:#0E1E30">
    <div style="border-bottom:1px solid #B8D5EF;padding-bottom:20px;margin-bottom:28px">
      <h1 style="font-size:26px;font-weight:300;letter-spacing:0.2em;color:#1B3A5C;margin:0">VØR<span style="color:#2A5FA5">.</span></h1>
      <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#6A8296;margin:6px 0 0">New Booking — ${m.refCode} — PAID</p>
    </div>
    <table style="width:100%;border-collapse:collapse">${bizRows}</table>
    <div style="margin-top:36px;padding-top:20px;border-top:1px solid #B8D5EF;font-size:11px;color:#6A8296">
      VØR Window Co. · Sydney &amp; ACT · info@vorwindowco.com
    </div>
  </div>`

  const clientHtml = `<div style="background:#f5f0e8;font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a">
    <div style="background:#1B3A5C;padding:30px 40px">
      <h1 style="font-size:22px;font-weight:300;letter-spacing:0.25em;color:#f5f0e8;margin:0">VØR<span style="color:#c9a84c">.</span></h1>
      <p style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(245,240,232,0.55);margin:5px 0 0">Window Co.</p>
    </div>
    <div style="padding:36px 40px">
      <p style="font-size:15px;line-height:1.8;color:#2c2c2c;margin:0 0 10px">Hi ${m.name},</p>
      <p style="font-size:14px;line-height:1.9;color:#5a4a2a;margin:0 0 24px">Your booking is confirmed and payment received. Here's your full summary.</p>
      <div style="background:#c9a84c;padding:18px;text-align:center;margin:0 0 24px">
        <p style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.85);margin:0 0 6px">Booking Reference</p>
        <p style="font-size:28px;font-weight:700;letter-spacing:0.2em;color:#fff;margin:0">${m.refCode}</p>
      </div>
      <div style="border-left:3px solid #c9a84c;margin:0 0 24px">
        <table style="width:100%;border-collapse:collapse">
          ${clientRow('Service',       m.tier)}
          ${clientRow('Appointment',   `${m.date} · ${m.time}`)}
          ${clientRow('Total Price',   `$${m.price} AUD`)}
          ${clientRow('Payment',       m.paymentType)}
          ${clientRow('Amount Paid',   `$${m.amountPaid} AUD`)}
          ${Number(m.balanceDue) > 0 ? clientRow('Balance Due on Day', `$${m.balanceDue} AUD`) : ''}
          ${m.note ? clientRow('Note', m.note) : ''}
        </table>
      </div>
      <p style="font-size:13px;line-height:1.8;color:#5a4a2a;margin:0 0 20px">Noah will be in touch to confirm your exact appointment time. Reply to this email or call if you need any changes.</p>
      <p style="font-size:12px;color:#8a7a5a;margin:0">
        <a href="tel:+61416572468" style="color:#c9a84c;text-decoration:none">0416 572 468</a> ·
        <a href="mailto:info@vorwindowco.com" style="color:#c9a84c;text-decoration:none">info@vorwindowco.com</a>
      </p>
    </div>
    <div style="background:#2c1f0e;padding:18px 40px;font-size:11px;color:rgba(245,240,232,0.45)">
      VØR Window Co. · Sydney &amp; ACT · vorwindowco.com
    </div>
  </div>`

  await Promise.all([
    resend.emails.send({
      from: FROM, to: BUSINESS_EMAIL, replyTo: m.email,
      subject: `[${m.refCode}] New booking — ${m.name} · ${m.tier} — PAID`,
      html: bizHtml,
    }),
    resend.emails.send({
      from: FROM, to: m.email, replyTo: BUSINESS_EMAIL,
      subject: `[${m.refCode}] Your VØR booking is confirmed — payment received`,
      html: clientHtml,
    }),
  ])
}

export async function POST(req: Request) {
  const body = await req.text()
  const sig  = req.headers.get('stripe-signature')

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET || !process.env.STRIPE_SECRET_KEY) {
    return new Response('Webhook not configured', { status: 400 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return new Response('Invalid signature', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    if (session.payment_status === 'paid' && session.metadata) {
      const m = session.metadata as Record<string, string>
      try {
        await sendBookingEmails(m, session.payment_intent as string)
      } catch (err) {
        console.error('Webhook email error:', err)
      }
      try {
        await sendBookingConfirmedSms({
          name: m.name, phone: m.phone, refCode: m.refCode,
          tier: m.tier, date: m.date, time: m.time,
          amountPaid: m.amountPaid, balanceDue: m.balanceDue,
        })
      } catch (err) {
        console.error('Webhook SMS error:', err)
      }
      try {
        const existing = await getAssignment(m.refCode)
        if (existing) {
          await saveAssignment({
            ...existing,
            paidAt: new Date().toISOString(),
            amountPaid: parseFloat(m.amountPaid),
            paymentType: m.paymentType,
          })
        }
      } catch (err) {
        console.error('Webhook assignment update error:', err)
      }
      addToCalendar({
        refCode: m.refCode, name: m.name, address: m.address ?? '',
        tier: m.tier, price: m.price, date: m.date, time: m.time, note: m.note,
      }).catch(() => {})
    }
  }

  return new Response('ok')
}
