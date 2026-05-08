import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'
import CustomCursor from '@/components/shared/CustomCursor'

const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['300', '400', '600'],
  style: ['normal', 'italic'],
  display: 'swap',
})

const jost = Jost({
  variable: '--font-jost',
  subsets: ['latin'],
  weight: ['200', '300', '400', '500'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'VØR Window Co. | Premium Window Cleaning Sydney & ACT',
  description:
    'VØR Window Co. delivers white-glove window cleaning for luxury homes and real estate across Sydney and the ACT. Book your consultation today.',
  keywords: 'window cleaning Sydney, premium window cleaning, luxury home cleaning, real estate window cleaning ACT, VOR Window Co',
  openGraph: {
    title: 'VØR Window Co. | Premium Window Cleaning Sydney & ACT',
    description:
      'Revealing clarity, elevating views. Premium window cleaning for discerning homeowners and real estate professionals across Sydney and the ACT.',
    type: 'website',
    locale: 'en_AU',
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: 'VØR Window Co.',
  description: 'Premium window cleaning services for luxury homes and real estate across Sydney and the ACT.',
  telephone: '+61416572468',
  email: 'hello@vorwindow.com.au',
  areaServed: ['Sydney', 'Australian Capital Territory'],
  priceRange: '$299 – $599+',
  serviceType: 'Window Cleaning',
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-AU" className={`${cormorant.variable} ${jost.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        <CustomCursor />
        {children}
      </body>
    </html>
  )
}
