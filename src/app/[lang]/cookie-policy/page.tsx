import type { Locale } from '@/lib/i18n'
import { getDictionary } from '@/lib/get-dictionary'
import { CookiePolicySection } from '@/components/sections/cookie-policy-section'

export default async function CookiePolicyPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  return <CookiePolicySection dict={dict} />
}
