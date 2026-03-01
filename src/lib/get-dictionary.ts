import type { Locale } from '@/lib/i18n'
import { locales, defaultLocale } from '@/lib/i18n'

const dictionaries = {
  pt: () => import('@/dictionaries/pt.json').then((m) => m.default),
  en: () => import('@/dictionaries/en.json').then((m) => m.default),
}

export async function getDictionary(locale: Locale) {
  const safeLocale = locales.includes(locale) ? locale : defaultLocale
  return dictionaries[safeLocale]()
}

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>
