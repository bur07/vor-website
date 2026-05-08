export interface ContactFormData {
  // Step 1 — Personal
  firstName: string
  lastName: string
  email: string
  phone: string
  contactPreference: string

  // Step 2 — Property
  propertyType: string
  address: string
  suburb: string
  postcode: string
  storeys: string
  windowCount: string
  accessNotes: string

  // Step 3 — Service
  service: string
  inclusions: string
  frequency: string

  // Step 4 — Schedule
  date: string
  altDate: string
  preferredTime: string
  referral: string
  notes: string
}
