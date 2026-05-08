import { Resend } from 'resend'
import type { ContactFormData } from '@/types'

export function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

function row(label: string, value: string) {
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid rgba(42,95,165,0.08);font-size:11px;letter-spacing:0.14em;text-transform:uppercase;color:#6A8296;width:38%;vertical-align:top">${label}</td>
      <td style="padding:10px 0;border-bottom:1px solid rgba(42,95,165,0.08);font-size:14px;color:#0E1E30">${value || '—'}</td>
    </tr>`
}

function section(title: string) {
  return `
    <tr>
      <td colspan="2" style="padding:20px 0 6px;font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#2A5FA5;font-weight:600">${title}</td>
    </tr>`
}

export function buildEmailHtml(data: ContactFormData): string {
  return `
    <div style="font-family:Georgia,serif;max-width:620px;margin:0 auto;padding:40px 32px;background:#FAF6EE;color:#0E1E30">
      <div style="border-bottom:1px solid #B8D5EF;padding-bottom:24px;margin-bottom:32px">
        <h1 style="font-size:28px;font-weight:300;letter-spacing:0.2em;color:#1B3A5C;margin:0">VØR<span style="color:#2A5FA5">.</span></h1>
        <p style="font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#6A8296;margin:6px 0 0">New Consultation Request</p>
      </div>

      <table style="width:100%;border-collapse:collapse">
        ${section('Contact Details')}
        ${row('Name',              `${data.firstName} ${data.lastName}`)}
        ${row('Email',             data.email)}
        ${row('Phone',             data.phone)}
        ${row('Preferred Contact', data.contactPreference)}

        ${section('Property')}
        ${row('Type',       data.propertyType)}
        ${row('Address',    `${data.address}, ${data.suburb} ${data.postcode}`)}
        ${row('Storeys',    data.storeys)}
        ${row('Windows',    data.windowCount)}
        ${row('Access',     data.accessNotes)}

        ${section('Service')}
        ${row('Package',    data.service)}
        ${row('Inclusions', data.inclusions)}
        ${row('Frequency',  data.frequency)}

        ${section('Schedule')}
        ${row('Preferred Date', data.date)}
        ${row('Alt. Date',      data.altDate)}
        ${row('Time of Day',    data.preferredTime)}
        ${row('Referral',       data.referral)}
        ${row('Notes',          data.notes)}
      </table>

      <div style="margin-top:40px;padding-top:24px;border-top:1px solid #B8D5EF;font-size:11px;color:#6A8296;letter-spacing:0.1em">
        VØR Window Co. · Sydney &amp; ACT · hello@vorwindow.com.au
      </div>
    </div>
  `
}
