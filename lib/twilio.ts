import twilio from 'twilio'
import type { ContactFormData } from '@/types'

export function getTwilio() {
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
}

const PACKAGE_LABELS: Record<string, string> = {
  'residential-small': 'Residential Small Home ($299)',
  'residential-mid':   'Residential Mid-Size Estate ($399)',
  'premium-estate':    'Premium Estate (from $599)',
  'commercial':        'Commercial — Custom Quote',
}

export function buildSmsBody(data: ContactFormData): string {
  const pkg = PACKAGE_LABELS[data.service] || data.service
  const address = [data.address, data.suburb].filter(Boolean).join(', ')

  return [
    `Hi ${data.firstName}, your VØR Window Co. consultation request has been received.`,
    ``,
    `Service: ${pkg}`,
    `Property: ${address}`,
    `Preferred date: ${data.date}`,
    ``,
    `Noah will be in touch within 24 hours to confirm your booking.`,
    ``,
    `Questions? Call or text Noah: 0416 572 468`,
  ].join('\n')
}

export async function sendClientSms(data: ContactFormData): Promise<void> {
  const sid   = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from  = process.env.TWILIO_FROM_NUMBER

  if (!sid || !token || !from) return

  const to = data.phone.replace(/\s/g, '').replace(/^0/, '+61')

  await getTwilio().messages.create({
    from,
    to,
    body: buildSmsBody(data),
  })
}
