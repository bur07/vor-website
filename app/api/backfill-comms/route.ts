import { Resend } from 'resend'
import { listAssignments, saveAssignment } from '@/lib/edgeStore'
import { sendReviewRequestSms } from '@/lib/twilio'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM   = 'VØR Window Co. <info@vorwindowco.com>'

export async function POST(req: Request) {
  const secret = req.headers.get('x-admin-secret')
  if (secret !== process.env.ADMIN_SECRET) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const all = await listAssignments()
  const THREE_DAYS = 3 * 24 * 60 * 60 * 1000
  const reviewLink = process.env.GOOGLE_REVIEW_LINK ?? 'https://g.page/r/vorwindowco/review'

  const reviewResults:   { refCode: string; name: string; sms: boolean; email: boolean }[] = []
  const followUpResults: { refCode: string; name: string; email: boolean }[] = []

  // ── 1. Review requests: paid but never asked ───────────────
  const pendingReviews = all.filter(a =>
    a.paidAt &&
    !a.reviewRequestSentAt &&
    !a.cancelledAt &&
    (a.clientEmail || a.clientPhone)
  )

  for (const a of pendingReviews) {
    const name = a.clientName ?? 'there'
    let sms = false, email = false

    if (a.clientPhone) {
      try { await sendReviewRequestSms({ name, phone: a.clientPhone, reviewLink }); sms = true } catch {}
    }
    if (a.clientEmail) {
      try {
        await resend.emails.send({
          from:    FROM,
          to:      a.clientEmail,
          subject: `Thank you for choosing VØR — ${a.refCode}`,
          html: `<div style="background:#f5f0e8;font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a">
  <div style="background:#1B3A5C;padding:30px 40px">
    <h1 style="font-size:22px;font-weight:300;letter-spacing:0.25em;color:#f5f0e8;margin:0">VØR<span style="color:#c9a84c">.</span></h1>
    <p style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(245,240,232,0.55);margin:5px 0 0">Window Co.</p>
  </div>
  <div style="height:3px;background:#c9a84c"></div>
  <div style="padding:36px 40px">
    <p style="font-size:15px;line-height:1.8;color:#2c2c2c;margin:0 0 8px">Hi ${name},</p>
    <p style="font-size:14px;line-height:1.9;color:#5a4a2a;margin:0 0 24px">Thank you for choosing VØR for your ${a.tier} window clean. We hope you're delighted with the results.</p>
    <p style="font-size:14px;line-height:1.9;color:#5a4a2a;margin:0 0 28px">If you have a moment, we'd love a Google review — it takes less than a minute and means the world to a small business.</p>
    <div style="text-align:center;margin:0 0 28px">
      <a href="${reviewLink}" style="display:inline-block;background:#c9a84c;color:#1B3A5C;font-size:14px;font-weight:700;letter-spacing:.08em;text-decoration:none;padding:14px 36px;border-radius:6px;">Leave a Review ★</a>
    </div>
    <p style="font-size:12px;color:#8a7a5a;margin:0">Noah · VØR Window Co. · <a href="tel:+61416572468" style="color:#c9a84c;text-decoration:none">0416 572 468</a></p>
  </div>
  <div style="background:#1B3A5C;padding:18px 40px;font-size:11px;color:rgba(245,240,232,0.45)">VØR Window Co. · Sydney &amp; ACT · vorwindowco.com</div>
</div>`,
        })
        email = true
      } catch {}
    }

    if (sms || email) {
      await saveAssignment({ ...a, reviewRequestSentAt: new Date().toISOString() })
    }
    reviewResults.push({ refCode: a.refCode, name, sms, email })
  }

  // ── 2. Quote follow-ups: unsigned 3+ days, never chased ───
  const pendingFollowUps = all.filter(a =>
    !a.clientSignedAt &&
    !a.paidAt &&
    !a.cancelledAt &&
    !a.followUpSentAt &&
    a.clientEmail &&
    Date.now() - new Date(a.assignedAt).getTime() >= THREE_DAYS
  )

  for (const a of pendingFollowUps) {
    const name = a.clientName ?? 'there'
    let sent = false
    try {
      await resend.emails.send({
        from:    FROM,
        to:      a.clientEmail!,
        subject: `Your VØR quote is waiting — ${a.refCode}`,
        html: `<div style="background:#f5f0e8;font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a">
  <div style="background:#1B3A5C;padding:30px 40px">
    <h1 style="font-size:22px;font-weight:300;letter-spacing:0.25em;color:#f5f0e8;margin:0">VØR<span style="color:#c9a84c">.</span></h1>
    <p style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:rgba(245,240,232,0.55);margin:5px 0 0">Window Co.</p>
  </div>
  <div style="height:3px;background:#c9a84c"></div>
  <div style="padding:36px 40px">
    <p style="font-size:15px;line-height:1.8;color:#2c2c2c;margin:0 0 8px">Hi ${name},</p>
    <p style="font-size:14px;line-height:1.9;color:#5a4a2a;margin:0 0 24px">Just checking in — your quote <strong>${a.refCode}</strong> is still waiting for your signature. Ready to lock in your booking?</p>
    <div style="text-align:center;margin:0 0 28px">
      <a href="https://vorwindowco.com/sign/${a.refCode}" style="display:inline-block;background:#1B3A5C;color:#f5f0e8;font-size:14px;font-weight:600;letter-spacing:.06em;text-decoration:none;padding:14px 36px;border-radius:6px;">Review &amp; Sign Quote →</a>
    </div>
    <p style="font-size:13px;line-height:1.8;color:#5a4a2a;margin:0 0 8px">Any questions before you sign? Happy to chat.</p>
    <p style="font-size:12px;color:#8a7a5a;margin:0">
      <a href="tel:+61416572468" style="color:#c9a84c;text-decoration:none">0416 572 468</a> ·
      <a href="mailto:info@vorwindowco.com" style="color:#c9a84c;text-decoration:none">info@vorwindowco.com</a>
    </p>
  </div>
  <div style="background:#1B3A5C;padding:18px 40px;font-size:11px;color:rgba(245,240,232,0.45)">VØR Window Co. · Sydney &amp; ACT · vorwindowco.com</div>
</div>`,
      })
      sent = true
      await saveAssignment({ ...a, followUpSentAt: new Date().toISOString() })
    } catch {}
    followUpResults.push({ refCode: a.refCode, name, email: sent })
  }

  return Response.json({
    ok: true,
    reviews:   { sent: reviewResults.filter(r => r.sms || r.email).length, results: reviewResults },
    followUps: { sent: followUpResults.filter(r => r.email).length, results: followUpResults },
  })
}
