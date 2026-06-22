import Stripe from 'stripe'
import { Resend } from 'resend'
import { getAssignment, saveAssignment } from '@/lib/edgeStore'
import { sendPostJobSms } from '@/lib/twilio'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = 'VØR Window Co. <info@vorwindowco.com>'

function completionEmail(opts: {
  name: string; refCode: string; tier: string
  price: number; address: string; paymentUrl: string
}) {
  const { name, refCode, tier, price, address, paymentUrl } = opts
  return `<div style="background:#f5f0e8;font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a">
  <div style="background:#1B3A5C;padding:30px 40px">
    <h1 style="font-size:22px;font-weight:300;letter-spacing:0.25em;color:#f5f0e8;margin:0">VØR<span style="color:#c9a84c">.</span></h1>
    <p style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(245,240,232,0.55);margin:5px 0 0">Window Co.</p>
  </div>
  <div style="height:3px;background:#c9a84c"></div>
  <div style="padding:36px 40px">
    <p style="font-size:15px;line-height:1.8;color:#2c2c2c;margin:0 0 8px">Hi ${name},</p>
    <p style="font-size:14px;line-height:1.9;color:#5a4a2a;margin:0 0 28px">Your windows are done and looking great. Thank you for choosing VØR.</p>
    <div style="border-left:3px solid #c9a84c;margin:0 0 28px">
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
          <td style="padding:9px 0 9px 16px;font-size:11px;letter-spacing:0.13em;text-transform:uppercase;color:#8a7a5a;border-bottom:1px solid rgba(201,168,76,0.2)">Property</td>
          <td style="padding:9px 0;font-size:13px;color:#2c2c2c;border-bottom:1px solid rgba(201,168,76,0.2)">${address}</td>
        </tr>` : ''}
        <tr>
          <td style="padding:9px 0 9px 16px;font-size:11px;letter-spacing:0.13em;text-transform:uppercase;color:#8a7a5a">Amount Due</td>
          <td style="padding:9px 0;font-size:15px;font-weight:700;color:#1B3A5C">$${price.toFixed(2)} AUD</td>
        </tr>
      </table>
    </div>
    <div style="text-align:center;margin:0 0 28px">
      <a href="${paymentUrl}"
         style="display:inline-block;background:#c9a84c;color:#fff;font-size:14px;font-family:-apple-system,sans-serif;font-weight:700;letter-spacing:0.06em;text-decoration:none;padding:16px 40px;border-radius:6px;">
        Pay Now — $${price.toFixed(2)} AUD
      </a>
      <p style="font-size:11px;color:#b0a898;margin:10px 0 0;font-family:-apple-system,sans-serif;">
        Secure payment via Stripe. Card accepted.
      </p>
    </div>
    <p style="font-size:13px;line-height:1.8;color:#5a4a2a;margin:0 0 8px">
      Cash and bank transfer also accepted — reply to this email or call if you'd prefer.
    </p>
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

export async function POST(req: Request) {
  // Validate shared secret so only vor-admin can call this
  const auth = req.headers.get('x-admin-secret')
  if (auth !== process.env.ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)
  try {
    const { refCode, testPhone } = await req.json()
    if (!refCode) return Response.json({ error: 'Missing refCode' }, { status: 400 })

    const assignment = await getAssignment(refCode)
    if (!assignment) return Response.json({ error: 'Assignment not found' }, { status: 404 })

    const phone = testPhone || assignment.clientPhone
    if (!phone && !assignment.clientEmail) {
      return Response.json({ error: 'No contact details on this booking' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'aud',
          unit_amount: Math.round((assignment.amountPaid ?? assignment.price) * 100),
          product_data: {
            name: `VØR Window Co. — ${assignment.tier} Window Clean`,
            description: assignment.clientAddress ?? undefined,
          },
        },
        quantity: 1,
      }],
      customer_email: assignment.clientEmail ?? undefined,
      metadata: {
        refCode:     assignment.refCode,
        name:        assignment.clientName    ?? '',
        email:       assignment.clientEmail   ?? '',
        phone:       assignment.clientPhone   ?? '',
        tier:        assignment.tier,
        price:       String(assignment.amountPaid ?? assignment.price),
        amountPaid:  String(assignment.amountPaid ?? assignment.price),
        balanceDue:  '0',
        paymentType: 'Stripe',
        address:     assignment.clientAddress ?? '',
        date:        assignment.appointmentDate  ?? '',
        time:        assignment.appointmentTime  ?? '',
      },
      success_url: 'https://vorwindowco.com/booking-confirmed',
      cancel_url:  'https://vorwindowco.com',
    })

    const shortUrl = `https://vorwindowco.com/pay/${assignment.refCode}`

    // Send SMS if phone exists
    if (phone) {
      await sendPostJobSms({
        name:       assignment.clientName ?? 'there',
        phone,
        tier:       assignment.tier,
        price:      assignment.amountPaid ?? assignment.price,
        paymentUrl: shortUrl,
      })
    }

    // Send completion email if email exists
    if (assignment.clientEmail) {
      await resend.emails.send({
        from:    FROM,
        to:      assignment.clientEmail,
        subject: `Service complete — ${assignment.refCode}`,
        html:    completionEmail({
          name:       assignment.clientName ?? 'there',
          refCode:    assignment.refCode,
          tier:       assignment.tier,
          price:      assignment.amountPaid ?? assignment.price,
          address:    assignment.clientAddress ?? '',
          paymentUrl: shortUrl,
        }),
      })
    }

    // Persist Stripe URL and SMS sent timestamp
    await saveAssignment({
      ...assignment,
      smsSentAt:    new Date().toISOString(),
      stripePayUrl: session.url!,
    })

    return Response.json({ ok: true, paymentUrl: shortUrl })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
