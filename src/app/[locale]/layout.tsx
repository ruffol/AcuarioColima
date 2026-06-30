import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/i18n/routing'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import { headers } from 'next/headers'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import WhatsAppButton from '@/components/layout/WhatsAppButton'
import CartDrawer from '@/components/cart/CartDrawer'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
})

const headingFont = Plus_Jakarta_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
})

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'HomePage' })
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.tlalchichi.xyz'
  const h = await headers()
  const pathname = h.get('x-invoke-path') || h.get('next-url') || ''
  const currentUrl = `${baseUrl}/${locale}${pathname.replace(/^\/(es|en)/, '')}`

  const alternateLanguages: Record<string, string> = {}
  for (const l of locales) {
    alternateLanguages[l] = `${baseUrl}/${l}${pathname.replace(/^\/(es|en)/, '')}`
  }
  alternateLanguages['x-default'] = `${baseUrl}/es${pathname.replace(/^\/(es|en)/, '')}`

  return {
    title: t('titulo'),
    description: t('subtitulo'),
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: currentUrl,
      languages: alternateLanguages,
    },
    openGraph: {
      title: t('titulo'),
      description: t('subtitulo'),
      url: currentUrl,
      siteName: 'AcuarioColima',
      locale: locale === 'es' ? 'es_MX' : 'en_US',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/img/iconologotlalchichi.svg`,
          width: 800,
          height: 800,
          alt: 'AcuarioColima',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('titulo'),
      description: t('subtitulo'),
      images: [`${baseUrl}/img/iconologotlalchichi.svg`],
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!locales.includes(locale as any)) {
    notFound()
  }

  const messages = await getMessages()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.acuariocolima.com'

  return (
    <html lang={locale} className={`${inter.variable} ${headingFont.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `
            try {
              const theme = localStorage.getItem('theme');
              if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
              }
            } catch(e) {}
          `
        }} />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased transition-colors duration-300">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'AcuarioColima',
              url: baseUrl,
              description: 'Todo para tu acuario en Colima — peces, accesorios y plantas acuáticas',
              inLanguage: locale === 'es' ? 'es-MX' : 'en-US',
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'AcuarioColima',
              url: baseUrl,
              logo: `${baseUrl}/img/iconologotlalchichi.svg`,
              description: 'Tienda especializada en acuarios, peces tropicales y accesorios en Colima, México',
              address: { '@type': 'PostalAddress', addressCountry: 'MX' },
            }),
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppButton />
          <CartDrawer />
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
