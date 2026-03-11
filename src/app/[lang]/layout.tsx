import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { Locale } from '@/lib/i18n'
import { locales } from '@/lib/i18n'
import { getDictionary } from '@/lib/get-dictionary'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'
import { DotGridBackground } from '@/components/sections/dot-grid-background'

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>
}): Promise<Metadata> {
  const { lang: rawLang } = await params
  const lang = locales.includes(rawLang as Locale) ? (rawLang as Locale) : 'en'
  const dict = await getDictionary(lang)
  return {
    title: {
      default: 'Greenlink | AI Factory on-demand',
      template: '%s | Greenlink',
    },
    description: dict.hero.subtitle,
    alternates: {
      languages: {
        'pt-PT': '/pt',
        'en-US': '/en',
      },
    },
  }
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  const lang = rawLang as Locale
  if (!locales.includes(lang)) notFound()
  const dict = await getDictionary(lang)

  return (
    <div className="relative">
      <DotGridBackground />
      <Header lang={lang} dict={dict} />
      <main>{children}</main>
      <Footer lang={lang} dict={dict} />
    </div>
  )
}
