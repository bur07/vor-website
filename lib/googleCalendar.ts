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

function parseTime(time: string): { hour: number; min: number } {
  const match = time.match(/^(\d+):(\d+)(am|pm)$/i)
  if (!match) return { hour: 9, min: 0 }
  let hour = parseInt(match[1])
  const min  = parseInt(match[2])
  const ampm = match[3].toLowerCase()
  if (ampm === 'pm' && hour !== 12) hour += 12
  if (ampm === 'am' && hour === 12) hour = 0
  return { hour, min }
}

function toIcsDate(date: string, hour: number, min: number): string {
  // Returns local datetime string without timezone (floating) for Sydney time
  const [y, m, d] = date.split('-')
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${y}${m}${d}T${pad(hour)}${pad(min)}00`
}

export function buildIcs(event: CalendarEvent): string {
  const { hour, min } = parseTime(event.time)
  const start = toIcsDate(event.date, hour, min)
  const end   = toIcsDate(event.date, hour + 2, min)
  const now   = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'

  const description = [
    `Ref: ${event.refCode}`,
    `Client: ${event.name}`,
    `Service: ${event.tier}`,
    `Price: $${event.price} AUD`,
    event.note ? `Note: ${event.note}` : '',
  ].filter(Boolean).join('\\n')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//VOR Window Co//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${event.refCode}@vorwindowco.com`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=Australia/Sydney:${start}`,
    `DTEND;TZID=Australia/Sydney:${end}`,
    `SUMMARY:[${event.refCode}] ${event.name} — ${event.tier}`,
    event.address ? `LOCATION:${event.address}` : '',
    `DESCRIPTION:${description}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n')
}

// No-op kept so callers don't need changing — ics is attached to emails directly
export async function addToCalendar(_event: CalendarEvent): Promise<void> {}
