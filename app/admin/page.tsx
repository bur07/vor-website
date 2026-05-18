import type { Metadata } from 'next'
import AdminPanel from '@/components/AdminPanel/AdminPanel'

export const metadata: Metadata = {
  title: 'Admin — VØR Window Co.',
}

export default function AdminPage() {
  return <AdminPanel />
}
