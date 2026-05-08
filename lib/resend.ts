import { Resend } from 'resend'
import type { ContactFormData } from '@/types'

export const resend = new Resend(process.env.RESEND_API_KEY)

export function buildEmailHtml(data: ContactFormData): string {
  return `
    <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 32px;background:#FAF6EE;color:#0E1E30">
      <div style="border-bottom:1px solid #B8D5EF;padding-bottom:24px;margin-bottom:32px">
        <h1 style="font-size:28px;font-weight:300;letter-spacing:0.2em;color:#1B3A5C;margin:0">VØR<span style="color:#2A5FA5">.</span></h1>
        <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#6A8296;margin:6px 0 0">New Consultation Request</p>
      </div>

      <table style="width:100%;border-collapse:collapse">
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(42,95,165,0.1);font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6A8296;width:40%">Name</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(42,95,165,0.1);font-size:14px;color:#0E1E30">${data.firstName} ${data.lastName}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(42,95,165,0.1);font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6A8296">Email</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(42,95,165,0.1);font-size:14px;color:#0E1E30">${data.email}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(42,95,165,0.1);font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6A8296">Phone</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(42,95,165,0.1);font-size:14px;color:#0E1E30">${data.phone}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(42,95,165,0.1);font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6A8296">Service</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(42,95,165,0.1);font-size:14px;color:#0E1E30">${data.service || '—'}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(42,95,165,0.1);font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6A8296">Preferred Date</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(42,95,165,0.1);font-size:14px;color:#0E1E30">${data.date || '—'}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;border-bottom:1px solid rgba(42,95,165,0.1);font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6A8296">Address</td>
          <td style="padding:10px 0;border-bottom:1px solid rgba(42,95,165,0.1);font-size:14px;color:#0E1E30">${data.address || '—'}</td>
        </tr>
        <tr>
          <td style="padding:10px 0;font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6A8296;vertical-align:top">Notes</td>
          <td style="padding:10px 0;font-size:14px;color:#0E1E30">${data.notes || '—'}</td>
        </tr>
      </table>

      <div style="margin-top:40px;padding-top:24px;border-top:1px solid #B8D5EF;font-size:11px;color:#6A8296;letter-spacing:0.1em">
        VØR Window Co. · Sydney &amp; ACT · hello@vorwindow.com.au
      </div>
    </div>
  `
}
