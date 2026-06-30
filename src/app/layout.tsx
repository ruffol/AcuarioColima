import type { Metadata } from 'next'
import './globals.css'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.acuariocolima.com'

export const metadata: Metadata = {
  title: 'AcuarioColima — Acuarios, peces y accesorios en Colima',
  description: 'Todo para tu acuario en Colima: peces tropicales, accesorios, plantas acuáticas y más. Envíos a todo México.',
  metadataBase: new URL(baseUrl),
  icons: {
    icon: '/img/favilogotlalchichi.png',
    apple: '/img/favilogotlalchichi.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return children
}

