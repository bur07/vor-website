import twilio from 'twilio'
import type { ContactFormData } from '@/types'

export function getTwilio() {
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
}

function formatPhone(phone: string): string {
  return phone.replace(/\s/g, '').replace(/^0/, '+61')
}

async function sendSms(to: string, body: string): Promise<void> {
  const sid   = process.env.TWILIO_ACCOUNT_SID
  const token = process.env.TWILIO_AUTH_TOKEN
  const from  = process.env.TWILIO_FROM_NUMBER
  if (!sid || !token || !from) return
  await getTwilio().messages.create({ from, to: formatPhone(to), body })
}

// ── Post-job payment request ──────────────────────────────

export async function sendPostJobSms(data: {
  name: string
  phone: string
  tier: string
  price: number
  paymentUrl: string
}): Promise<void> {
  const firstName = data.name.split(' ')[0]
  const body = [
    `Hey ${firstName}, it's Noah from VØR Window Co. We were delighted to complete your ${data.tier} window clean today!`,
    ``,
    `Your total is $${data.price.toLocaleString()} AUD. Pay securely online:`,
    data.paymentUrl,
    ``,
    `Or by bank transfer:`,
    `Noah Rylands`,
    `BSB - 062197`,
    `Account - 11058678`,
    `PayID - 0416572468`,
    ``,
    `Also, for every 5 referrals you receive a complimentary exterior clean. We'll send through a Google review link shortly — thank you for choosing VØR! 🪟`,
  ].join('\n')
  await sendSms(data.phone, body)
}

// ── Contact form (legacy) ───────────────────────────────────

const PACKAGE_LABELS: Record<string, string> = {
  'residential-small': 'Residential Small Home ($299)',
  'residential-mid':   'Residential Mid-Size Estate ($399)',
  'premium-estate':    'Premium Estate (from $599)',
  'commercial':        'Commercial — Custom Quote',
}

export async function sendClientSms(data: ContactFormData): Promise<void> {
  const pkg = PACKAGE_LABELS[data.service] || data.service
  const address = [data.address, data.suburb].filter(Boolean).join(', ')
  const body = [
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
  await sendSms(data.phone, body)
}

// ── Quote request received ──────────────────────────────────

export async function sendQuoteRequestSms(data: {
  name: string
  phone: string
  refCode: string
  address: string
}): Promise<void> {
  const body = [
    `Hi ${data.name}, VØR Window Co. has received your quote request.`,
    ``,
    `Reference: ${data.refCode}`,
    `Property: ${data.address}`,
    ``,
    `We'll prepare your personalised quote within 24 hours.`,
    ``,
    `Questions? Call or text Noah: 0416 572 468`,
  ].join('\n')
  await sendSms(data.phone, body)
}

// ── 24-hour appointment reminder ───────────────────────────

export async function sendReminderSms(data: {
  name: string
  phone: string
  tier: string
  date: string
  time: string
  address: string
}): Promise<void> {
  const firstName = data.name.split(' ')[0]
  const body = [
    `Hi ${firstName}, just a reminder that your VØR window clean is tomorrow.`,
    ``,
    `Service: ${data.tier}`,
    `When: ${data.date}${data.time ? ` · ${data.time}` : ''}`,
    `${data.address ? `Where: ${data.address}\n` : ''}`,
    `Need to reschedule? Call or text Noah: 0416 572 468`,
  ].join('\n')
  await sendSms(data.phone, body)
}

// ── Booking confirmed (post-payment) ───────────────────────

export async function sendBookingConfirmedSms(data: {
  name: string
  phone: string
  refCode: string
  tier: string
  date: string
  time: string
  amountPaid: string
  balanceDue: string
}): Promise<void> {
  const balance = Number(data.balanceDue) > 0
    ? `\nBalance due on the day: $${data.balanceDue} AUD`
    : ''
  const body = [
    `Hi ${data.name}, your VØR Window Co. booking is confirmed!`,
    ``,
    `Reference: ${data.refCode}`,
    `Service: ${data.tier}`,
    `Appointment: ${data.date} · ${data.time}`,
    `Paid: $${data.amountPaid} AUD${balance}`,
    ``,
    `Noah will confirm your exact time shortly.`,
    `Questions? Call or text: 0416 572 468`,
  ].join('\n')
  await sendSms(data.phone, body)
}
