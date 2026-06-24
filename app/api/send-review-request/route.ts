import { Resend } from 'resend'
import { sendReviewRequestSms } from '@/lib/twilio'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = 'VØR Window Co. <info@vorwindowco.com>'

function reviewEmail(opts: { name: string; refCode: string; tier: string; reviewLink: string }) {
  const { name, refCode, tier, reviewLink } = opts
  return `<div style="background:#f5f0e8;font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a">
  <div style="background:#1B3A5C;padding:30px 40px">
    <h1 style="font-size:22px;font-weight:300;letter-spacing:0.25em;color:#f5f0e8;margin:0">VØR<span style="color:#c9a84c">.</span></h1>
    <p style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(245,240,232,0.55);margin:5px 0 0">Window Co.</p>
  </div>
  <div style="height:3px;background:#c9a84c"></div>
  <div style="padding:36px 40px">
    <p style="font-size:15px;line-height:1.8;color:#2c2c2c;margin:0 0 8px">Hi ${name},</p>
    <p style="font-size:14px;line-height:1.9;color:#5a4a2a;margin:0 0 24px">
      Thank you for choosing VØR for your ${tier} window clean. We hope you're delighted with the results.
    </p>
    <p style="font-size:14px;line-height:1.9;color:#5a4a2a;margin:0 0 28px">
      If you have a moment, we'd love it if you could leave us a Google review — it takes less than a minute and helps us enormously as a small business.
    </p>
    <div style="text-align:center;margin:0 0 28px">
      <a href="${reviewLink}"
         style="display:inline-block;background:#c9a84c;color:#1B3A5C;font-size:14px;font-family:-apple-system,sans-serif;font-weight:700;letter-spacing:.08em;text-decoration:none;padding:14px 36px;border-radius:6px;">
        Leave a Review ★
      </a>
    </div>
    <div style="border-left:3px solid #c9a84c;padding:10px 16px;margin:0 0 24px;background:rgba(201,168,76,0.05)">
      <div style="font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:#8a7a5a;margin-bottom:3px">Job reference</div>
      <div style="font-size:13px;color:#2c2c2c">${refCode}</div>
    </div>
    <p style="font-size:13px;line-height:1.8;color:#5a4a2a;margin:0">
      Thank you — we look forward to serving you again.<br/>
      <strong style="color:#1B3A5C">Noah · VØR Window Co.</strong>
    </p>
  </div>
  <div style="background:#1B3A5C;padding:18px 40px;font-size:11px;color:rgba(245,240,232,0.45);letter-spacing:0.1em">
    VØR Window Co. · Sydney &amp; ACT · vorwindowco.com
  </div>
</div>`
}

export async function POST(req: Request) {
  const secret = req.headers.get('x-admin-secret')
  if (secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { name, email, phone, refCode, tier } = await req.json()
    const reviewLink = process.env.GOOGLE_REVIEW_LINK ?? 'https://g.page/r/vorwindowco/review'

    let smsSent = false, emailSent = false

    if (phone) {
      try {
        await sendReviewRequestSms({ name, phone, reviewLink })
        smsSent = true
      } catch { /* non-fatal */ }
    }

    if (email) {
      try {
        await resend.emails.send({
          from:    FROM,
          to:      email,
          subject: `Thank you for choosing VØR — ${refCode}`,
          html:    reviewEmail({ name, refCode, tier, reviewLink }),
        })
        emailSent = true
      } catch { /* non-fatal */ }
    }

    return Response.json({ ok: true, smsSent, emailSent })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
