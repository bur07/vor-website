import { google } from 'googleapis'

function getAuth() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  if (!raw) return null
  const key = JSON.parse(raw)
  return new google.auth.GoogleAuth({
    credentials: key,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  })
}

export interface CalendarEvent {
  refCode: string
  name: string
  address: string
  tier: string
  price: string | number
  date: string   // YYYY-MM-DD
  time: string   // e.g. "10:00am"
  note?: string
}

function parseDateTime(date: string, time: string): { start: string; end: string } {
  // time is like "10:00am" or "2:00pm"
  const match = time.match(/^(\d+):(\d+)(am|pm)$/i)
  if (!match) {
    // Fallback: all-day event
    return { start: date, end: date }
  }
  let hour = parseInt(match[1])
  const min  = parseInt(match[2])
  const ampm = match[3].toLowerCase()
  if (ampm === 'pm' && hour !== 12) hour += 12
  if (ampm === 'am' && hour === 12) hour = 0
  const pad = (n: number) => String(n).padStart(2, '0')
  const startIso = `${date}T${pad(hour)}:${pad(min)}:00`
  const endIso   = `${date}T${pad(hour + 2)}:${pad(min)}:00`
  return { start: startIso, end: endIso }
}

export async function addToCalendar(event: CalendarEvent): Promise<void> {
  const auth = getAuth()
  if (!auth) return

  const calendarId = process.env.GOOGLE_CALENDAR_ID ?? 'primary'
  const calendar = google.calendar({ version: 'v3', auth })
  const { start, end } = parseDateTime(event.date, event.time)

  const isAllDay = !start.includes('T')

  await calendar.events.insert({
    calendarId,
    requestBody: {
      summary: `[${event.refCode}] ${event.name} — ${event.tier}`,
      location: event.address || undefined,
      description: [
        `Ref: ${event.refCode}`,
        `Client: ${event.name}`,
        `Service: ${event.tier}`,
        `Price: $${event.price} AUD`,
        event.note ? `Note: ${event.note}` : '',
      ].filter(Boolean).join('\n'),
      ...(isAllDay
        ? { start: { date: start }, end: { date: end } }
        : { start: { dateTime: start, timeZone: 'Australia/Sydney' }, end: { dateTime: end, timeZone: 'Australia/Sydney' } }
      ),
    },
  })
}
