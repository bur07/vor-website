import { Resend } from 'resend'

const resend   = new Resend(process.env.RESEND_API_KEY)
const FROM     = 'VØR Window Co. <info@vorwindowco.com>'
const BIZ      = 'info@vorwindowco.com'

interface QuoteItem { description: string; price: number }
interface QuoteData {
  quoteRef: string; quoteDate: string; validUntil: string
  clientName: string; clientEmail: string; clientPhone?: string; clientAddress?: string
  items: QuoteItem[]; notes?: string; includeGst: boolean
}

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function buildHTML(d: QuoteData): string {
  const subtotal = d.items.reduce((s, i) => s + i.price, 0)
  const gst      = d.includeGst ? Math.round(subtotal * 0.1 * 100) / 100 : 0
  const total    = subtotal + gst

  const rows = d.items.map(i => `
    <tr>
      <td style="padding:14px 16px;font-size:13px;color:#1a1a1a;border-bottom:1px solid #ede7d9;">${esc(i.description)}</td>
      <td style="padding:14px 16px;font-size:13px;color:#6a6a6a;text-align:center;border-bottom:1px solid #ede7d9;">1</td>
      <td style="padding:14px 16px;font-size:13px;color:#6a6a6a;text-align:right;border-bottom:1px solid #ede7d9;">$${i.price.toFixed(2)}</td>
      <td style="padding:14px 16px;font-size:13px;font-weight:600;color:#1a1a1a;text-align:right;border-bottom:1px solid #ede7d9;">$${i.price.toFixed(2)}</td>
    </tr>`).join('')

  const totalsRows = d.includeGst ? `
    <tr>
      <td></td><td colspan="2" style="padding:8px 16px;font-size:11px;color:#6a6a6a;text-transform:uppercase;letter-spacing:.1em;text-align:right;border-top:1px solid #ede7d9;">Subtotal</td>
      <td style="padding:8px 16px;font-size:13px;color:#1a1a1a;text-align:right;width:110px;">$${subtotal.toFixed(2)}</td>
    </tr>
    <tr>
      <td></td><td colspan="2" style="padding:8px 16px;font-size:11px;color:#6a6a6a;text-transform:uppercase;letter-spacing:.1em;text-align:right;border-top:1px solid #ede7d9;">GST (10%)</td>
      <td style="padding:8px 16px;font-size:13px;color:#1a1a1a;text-align:right;width:110px;">$${gst.toFixed(2)}</td>
    </tr>
    <tr style="background:#c9a84c;">
      <td></td><td colspan="2" style="padding:13px 16px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#fff;text-align:right;">Total AUD</td>
      <td style="padding:13px 16px;font-size:16px;font-weight:700;color:#fff;text-align:right;width:110px;">$${total.toFixed(2)}</td>
    </tr>` : `
    <tr style="background:#c9a84c;">
      <td></td><td colspan="2" style="padding:13px 16px;font-size:12px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#fff;text-align:right;">Total AUD</td>
      <td style="padding:13px 16px;font-size:16px;font-weight:700;color:#fff;text-align:right;width:110px;">$${total.toFixed(2)}</td>
    </tr>`

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:24px;background:#f0ece4;font-family:Georgia,'Times New Roman',serif;">
<div style="max-width:680px;margin:0 auto;background:#fff;box-shadow:0 4px 24px rgba(0,0,0,.1);">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1B3A5C;"><tr>
    <td style="padding:30px 44px;">
      <div style="font-size:26px;font-weight:300;letter-spacing:.25em;color:#f5f0e8;">VØR<span style="color:#c9a84c;">.</span></div>
      <div style="font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:rgba(245,240,232,.5);margin-top:5px;">Window Co.</div>
    </td>
    <td style="padding:30px 44px;text-align:right;vertical-align:top;">
      <div style="font-size:22px;font-weight:300;letter-spacing:.35em;text-transform:uppercase;color:rgba(245,240,232,.85);">Quote</div>
      <div style="font-size:11px;color:#c9a84c;letter-spacing:.12em;margin-top:6px;">${esc(d.quoteRef)}</div>
    </td>
  </tr></table>
  <div style="height:3px;background:#c9a84c;"></div>
  <table width="100%" cellpadding="0" cellspacing="0"><tr>
    <td width="50%" style="padding:36px 24px 0 44px;vertical-align:top;">
      <div style="font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#8a7a5a;margin-bottom:10px;">From</div>
      <div style="font-size:15px;font-weight:bold;color:#1B3A5C;">VØR Window Co.</div>
      <div style="font-size:13px;color:#5a5a5a;margin-top:3px;">Sydney &amp; ACT</div>
      <div style="font-size:13px;color:#5a5a5a;">0416 572 468</div>
      <div style="font-size:13px;color:#5a5a5a;">info@vorwindowco.com</div>
    </td>
    <td width="50%" style="padding:36px 44px 0 24px;vertical-align:top;">
      <div style="font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#8a7a5a;margin-bottom:10px;">To</div>
      <div style="font-size:15px;font-weight:bold;color:#1B3A5C;">${esc(d.clientName)}</div>
      ${d.clientAddress ? `<div style="font-size:13px;color:#5a5a5a;margin-top:3px;">${esc(d.clientAddress)}</div>` : ''}
      ${d.clientPhone   ? `<div style="font-size:13px;color:#5a5a5a;">${esc(d.clientPhone)}</div>` : ''}
      <div style="font-size:13px;color:#5a5a5a;">${esc(d.clientEmail)}</div>
    </td>
  </tr></table>
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:28px 44px 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8f5f0;border:1px solid #e8dcc8;">
      <tr><td style="padding:9px 20px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8a7a5a;">Quote Date</td><td style="padding:9px 20px;font-size:13px;color:#1a1a1a;text-align:right;">${esc(d.quoteDate)}</td></tr>
      <tr style="border-top:1px solid rgba(201,168,76,.2);"><td style="padding:9px 20px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8a7a5a;">Reference</td><td style="padding:9px 20px;font-size:13px;color:#1a1a1a;text-align:right;">${esc(d.quoteRef)}</td></tr>
      <tr style="border-top:1px solid rgba(201,168,76,.2);"><td style="padding:9px 20px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#8a7a5a;">Valid Until</td><td style="padding:9px 20px;font-size:13px;color:#1a1a1a;text-align:right;">${esc(d.validUntil)}</td></tr>
    </table>
  </td></tr></table>
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:28px 44px 0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <thead><tr style="background:#1B3A5C;">
        <th style="text-align:left;padding:11px 16px;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:rgba(245,240,232,.75);font-weight:400;">Description</th>
        <th style="text-align:center;padding:11px 16px;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:rgba(245,240,232,.75);font-weight:400;width:60px;">Qty</th>
        <th style="text-align:right;padding:11px 16px;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:rgba(245,240,232,.75);font-weight:400;width:100px;">Unit Price</th>
        <th style="text-align:right;padding:11px 16px;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:rgba(245,240,232,.75);font-weight:400;width:100px;">Total</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #1B3A5C;">${totalsRows}</table>
  </td></tr></table>
  ${d.notes ? `
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:28px 44px 0;">
    <div style="padding:16px 20px;border-left:3px solid #c9a84c;background:#faf7f2;">
      <div style="font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#8a7a5a;margin-bottom:7px;">Notes &amp; Terms</div>
      <div style="font-size:13px;color:#4a4a4a;line-height:1.75;">${esc(d.notes).replace(/\n/g,'<br>')}</div>
    </div>
  </td></tr></table>` : ''}
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:32px 44px 0;">
    <div style="border-top:1px solid #ede7d9;padding-top:28px;text-align:center;">
      <a href="https://vor-admin.vercel.app/sign/${esc(d.quoteRef)}"
         style="display:inline-block;background:#1B3A5C;color:#f5f0e8;font-size:13px;font-family:-apple-system,sans-serif;font-weight:600;letter-spacing:.08em;text-decoration:none;padding:14px 36px;border-radius:6px;">
        Accept &amp; Sign Quote →
      </a>
      <div style="margin-top:12px;font-size:11px;color:#b0a898;font-family:-apple-system,sans-serif;">
        Or copy this link: https://vor-admin.vercel.app/sign/${esc(d.quoteRef)}
      </div>
    </div>
  </td></tr></table>
  <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:36px;background:#1B3A5C;"><tr>
    <td style="padding:18px 44px;font-size:11px;color:rgba(245,240,232,.4);letter-spacing:.1em;">
      VØR Window Co. &nbsp;·&nbsp; Sydney &amp; ACT &nbsp;·&nbsp; 0416 572 468 &nbsp;·&nbsp; info@vorwindowco.com
    </td>
  </tr></table>
</div>
</body></html>`
}

export async function POST(req: Request) {
  try {
    const secret = req.headers.get('x-admin-secret')
    if (secret !== process.env.ADMIN_SECRET) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const d: QuoteData = await req.json()
    if (!d.clientEmail || !d.clientName || !d.items?.length) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const html = buildHTML(d)

    await Promise.all([
      resend.emails.send({
        from: FROM, to: d.clientEmail, replyTo: BIZ,
        subject: `Your Quote from VØR Window Co. — ${d.quoteRef}`,
        html,
      }),
      resend.emails.send({
        from: FROM, to: BIZ, replyTo: d.clientEmail,
        subject: `[Quote Sent] ${d.quoteRef} — ${d.clientName}`,
        html,
      }),
    ])

    return Response.json({ ok: true })
  } catch (err) {
    console.error('send-quote error:', err)
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
