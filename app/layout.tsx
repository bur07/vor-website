import type { Metadata } from 'next'
import { Cormorant_Garamond, Jost } from 'next/font/google'
import './globals.css'
import CustomCursor from '@/components/shared/CustomCursor'
import FloatingCTA from '@/components/FloatingCTA/FloatingCTA'

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
  title: {
    default: 'VØR Window Co. | Premium Window Cleaning Sydney & ACT',
    template: '%s | VØR Window Co.',
  },
  description:
    'Sydney\'s most trusted premium window cleaning service. Residential and commercial window cleaning across Sydney and the ACT. 100% satisfaction guaranteed. Same-week availability.',
  keywords: [
    'window cleaning Sydney',
    'window cleaner Sydney',
    'window cleaning Northern Beaches',
    'window cleaning ACT',
    'luxury home window cleaning',
    'real estate window cleaning',
    'professional window cleaner',
    'window cleaning Manly',
    'window cleaning Mosman',
    'VOR Window Co',
  ],
  authors: [{ name: 'VØR Window Co.' }],
  creator: 'VØR Window Co.',
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    siteName: 'VØR Window Co.',
    title: 'VØR Window Co. | Premium Window Cleaning Sydney & ACT',
    description:
      'Sydney\'s most trusted premium window cleaning service. Residential and commercial window cleaning across Sydney and the ACT.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VØR Window Co. | Premium Window Cleaning Sydney & ACT',
    description: 'Premium window cleaning for luxury homes and real estate across Sydney and the ACT.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': 'https://vorwindow.com.au',
  name: 'VØR Window Co.',
  description: 'Premium window cleaning services for luxury homes and real estate across Sydney and the ACT.',
  url: 'https://vorwindow.com.au',
  telephone: '+61416572468',
  email: 'hello@vorwindow.com.au',
  image: 'https://vorwindow.com.au/og-image.jpg',
  priceRange: '$299 – $599+',
  currenciesAccepted: 'AUD',
  paymentAccepted: 'Cash, Credit Card, Bank Transfer',
  areaServed: [
    { '@type': 'City', name: 'Sydney' },
    { '@type': 'State', name: 'New South Wales' },
    { '@type': 'State', name: 'Australian Capital Territory' },
  ],
  serviceType: 'Window Cleaning',
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: '47',
    bestRating: '5',
  },
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: 'Window Cleaning Services',
    itemListElement: [
      { '@type': 'Offer', name: 'Residential Small Home', price: '299', priceCurrency: 'AUD' },
      { '@type': 'Offer', name: 'Mid-Size Estate', price: '399', priceCurrency: 'AUD' },
      { '@type': 'Offer', name: 'Premium Estate', price: '599', priceCurrency: 'AUD' },
    ],
  },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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
        <FloatingCTA />
      </body>
    </html>
  )
}
