// Next.js API route — mirrors netlify/functions/send-quote-email.js for Vercel deployments
import { Resend } from 'resend'
import { kv } from '@vercel/kv'

const FROM = 'VØR Window Co. <info@vorwindowco.com>'
const BUSINESS_EMAIL = 'info@vorwindowco.com'

function bizRow(label: string, value: string) {
  return `<tr>
    <td style="padding:9px 0;border-bottom:1px solid rgba(42,95,165,0.08);font-size:11px;letter-spacing:0.13em;text-transform:uppercase;color:#6A8296;width:38%;vertical-align:top">${label}</td>
    <td style="padding:9px 0;border-bottom:1px solid rgba(42,95,165,0.08);font-size:13px;color:#0E1E30">${value || '—'}</td>
  </tr>`
}

function bizWrap(sub: string, rows: string) {
  return `<div style="font-family:Georgia,serif;max-width:620px;margin:0 auto;padding:40px 32px;background:#FAF6EE;color:#0E1E30">
    <div style="border-bottom:1px solid #B8D5EF;padding-bottom:20px;margin-bottom:28px">
      <h1 style="font-size:26px;font-weight:300;letter-spacing:0.2em;color:#1B3A5C;margin:0">VØR<span style="color:#2A5FA5">.</span></h1>
      <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#6A8296;margin:6px 0 0">${sub}</p>
    </div>
    <table style="width:100%;border-collapse:collapse">${rows}</table>
    <div style="margin-top:36px;padding-top:20px;border-top:1px solid #B8D5EF;font-size:11px;color:#6A8296;letter-spacing:0.08em">
      VØR Window Co. · Sydney &amp; ACT · info@vorwindowco.com
    </div>
  </div>`
}

function clientRow(label: string, value: string) {
  return `<tr>
    <td style="padding:9px 0 9px 16px;font-size:11px;letter-spacing:0.13em;text-transform:uppercase;color:#8a7a5a;width:42%;border-bottom:1px solid rgba(201,168,76,0.2)">${label}</td>
    <td style="padding:9px 0;font-size:13px;color:#2c2c2c;border-bottom:1px solid rgba(201,168,76,0.2)">${value || '—'}</td>
  </tr>`
}

function clientWrap(inner: string) {
  return `<div style="background:#f5f0e8;font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a">
    <div style="background:#1B3A5C;padding:30px 40px">
      <h1 style="font-size:22px;font-weight:300;letter-spacing:0.25em;color:#f5f0e8;margin:0">VØR<span style="color:#c9a84c">.</span></h1>
      <p style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(245,240,232,0.55);margin:5px 0 0">Window Co.</p>
    </div>
    <div style="padding:36px 40px">${inner}</div>
    <div style="background:#2c1f0e;padding:18px 40px;font-size:11px;color:rgba(245,240,232,0.45);letter-spacing:0.1em">
      VØR Window Co. · Sydney &amp; ACT · vorwindowco.com
    </div>
  </div>`
}

function refBox(refCode: string) {
  return `<div style="background:#c9a84c;padding:22px;text-align:center;margin:24px 0">
    <p style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:rgba(255,255,255,0.85);margin:0 0 8px">Your Reference Code</p>
    <p style="font-size:34px;font-weight:700;letter-spacing:0.2em;color:#fff;margin:0">${refCode}</p>
    <p style="font-size:11px;color:rgba(255,255,255,0.72);margin:7px 0 0">You'll need this code to view and book your service</p>
  </div>`
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function buildEmails(d: any) {
  if (d.type === 'quote') {
    const bizRows = [
      bizRow('Reference', `<strong>${d.refCode}</strong>`),
      bizRow('Name', d.name), bizRow('Email', d.email), bizRow('Phone', d.phone),
      bizRow('Address', d.address), bizRow('Property Type', d.propertyType),
      bizRow('Property Size', d.propertySize), bizRow('Storeys', d.storeys),
      bizRow('Inspection Date', d.inspectionDate), bizRow('Inspection Time', d.inspectionTime),
      bizRow('Service Area', d.serviceArea), bizRow('Special Requirements', d.specialRequirements),
    ].join('')

    const clientInner = `
      <p style="font-size:15px;line-height:1.8;color:#2c2c2c;margin:0 0 10px">Hi ${d.name},</p>
      <p style="font-size:14px;line-height:1.9;color:#5a4a2a;margin:0 0 24px">Thank you for your quote request. We'll prepare a personalised quote within 24 hours.</p>
      ${refBox(d.refCode)}
      <div style="border-left:3px solid #c9a84c;margin:0 0 24px">
        <table style="width:100%;border-collapse:collapse">
          ${clientRow('Property', d.address)}
          ${clientRow('Type', `${d.propertyType} — ${d.propertySize}`)}
          ${clientRow('Storeys', d.storeys)}
          ${clientRow('Inspection', `${d.inspectionDate} · ${d.inspectionTime}`)}
          ${clientRow('Service Area', d.serviceArea)}
          ${d.specialRequirements ? clientRow('Requirements', d.specialRequirements) : ''}
        </table>
      </div>
      <div style="text-align:center;margin:28px 0">
        <a href="https://vorwindowco.com/booking?ref=${d.refCode}" style="display:inline-block;background:#1B3A5C;color:#f5f0e8;font-size:11px;letter-spacing:0.22em;text-transform:uppercase;text-decoration:none;padding:14px 32px">Complete Your Booking →</a>
        <p style="font-size:11px;color:#8a7a5a;margin:10px 0 0">This link will work once your quote has been prepared.</p>
      </div>
      <p style="font-size:12px;color:#8a7a5a;margin:0">
        Questions? Reply to this email or call Noah on <a href="tel:+61416572468" style="color:#c9a84c;text-decoration:none">0416 572 468</a>
      </p>`

    return {
      biz: { subject: `[${d.refCode}] New quote request — ${d.name}`, html: bizWrap('New Quote Request — ' + d.refCode, bizRows) },
      client: { subject: `[${d.refCode}] Your VØR Window Co. quote request`, html: clientWrap(clientInner) },
      replyToBiz: d.email, replyToClient: BUSINESS_EMAIL, clientEmail: d.email,
    }
  }

  // booking
  const bizRows = [
    bizRow('Reference', `<strong>${d.refCode}</strong>`),
    bizRow('Name', d.name), bizRow('Email', d.email), bizRow('Phone', d.phone),
    bizRow('Service Tier', d.tier), bizRow('Total Price', `$${d.price} AUD`),
    bizRow('Payment Type', d.paymentType), bizRow('Amount Paid', `$${d.amountPaid} AUD`),
    bizRow('Balance Due', `$${d.balanceDue} AUD`),
    bizRow('Appointment Date', d.date), bizRow('Appointment Time', d.time),
    d.note ? bizRow('Quote Note', d.note) : '',
  ].join('')

  const clientInner = `
    <p style="font-size:15px;line-height:1.8;color:#2c2c2c;margin:0 0 10px">Hi ${d.name},</p>
    <p style="font-size:14px;line-height:1.9;color:#5a4a2a;margin:0 0 24px">Your booking is confirmed. Here's a full summary for your records.</p>
    <div style="border-left:3px solid #c9a84c;margin:0 0 24px">
      <table style="width:100%;border-collapse:collapse">
        ${clientRow('Reference', d.refCode)}
        ${clientRow('Service', d.tier)}
        ${clientRow('Appointment', `${d.date} · ${d.time}`)}
        ${clientRow('Total Price', `$${d.price} AUD`)}
        ${clientRow('Payment', d.paymentType)}
        ${clientRow('Amount Paid', `$${d.amountPaid} AUD`)}
        ${Number(d.balanceDue) > 0 ? clientRow('Balance Due on Day', `$${d.balanceDue} AUD`) : ''}
        ${d.note ? clientRow('Note', d.note) : ''}
      </table>
    </div>
    <p style="font-size:13px;line-height:1.8;color:#5a4a2a;margin:0 0 20px">Noah will be in touch to confirm your appointment time. Reply to this email or call if you need any changes.</p>
    <p style="font-size:12px;color:#8a7a5a;margin:0">
      <a href="tel:+61416572468" style="color:#c9a84c;text-decoration:none">0416 572 468</a> ·
      <a href="mailto:info@vorwindowco.com" style="color:#c9a84c;text-decoration:none">info@vorwindowco.com</a>
    </p>`

  return {
    biz: { subject: `[${d.refCode}] New booking — ${d.name} · ${d.tier}`, html: bizWrap('New Booking — ' + d.refCode, bizRows) },
    client: { subject: `[${d.refCode}] Your VØR booking is confirmed`, html: clientWrap(clientInner) },
    replyToBiz: d.email, replyToClient: BUSINESS_EMAIL, clientEmail: d.email,
  }
}

export async function POST(req: Request) {
  try {
    const d = await req.json()
    if (!d.type || !d.email) return Response.json({ error: 'Missing fields' }, { status: 400 })

    const resend = new Resend(process.env.RESEND_API_KEY)
    const { biz, client, replyToBiz, replyToClient, clientEmail } = buildEmails(d)

    await Promise.all([
      resend.emails.send({ from: FROM, to: BUSINESS_EMAIL, replyTo: replyToBiz, ...biz }),
      resend.emails.send({ from: FROM, to: clientEmail, replyTo: replyToClient, ...client }),
    ])

    // Persist quote request so admin panel can display client info
    if (d.type === 'quote') {
      try {
        await kv.set(`req:${d.refCode}`, {
          refCode:              d.refCode,
          name:                 d.name,
          email:                d.email,
          phone:                d.phone,
          address:              d.address,
          propertyType:         d.propertyType,
          propertySize:         d.propertySize,
          storeys:              d.storeys,
          inspectionDate:       d.inspectionDate,
          inspectionTime:       d.inspectionTime,
          serviceArea:          d.serviceArea,
          specialRequirements:  d.specialRequirements,
          submittedAt:          new Date().toISOString(),
        }, { ex: 60 * 60 * 24 * 90 }) // 90-day expiry
      } catch {
        // KV not configured — emails still sent, admin won't show pending requests
      }
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('send-quote-email route error:', err)
    return Response.json({ error: 'Failed' }, { status: 500 })
  }
}
