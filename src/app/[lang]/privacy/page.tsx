import type { Locale } from '@/lib/i18n'
import { getDictionary } from '@/lib/get-dictionary'
import { PrivacyPolicySection } from '@/components/sections/privacy-policy-section'

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  return <PrivacyPolicySection dict={dict} lang={lang} />
}
