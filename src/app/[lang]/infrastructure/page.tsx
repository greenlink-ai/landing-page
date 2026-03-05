import type { Locale } from '@/lib/i18n'
import { getDictionary } from '@/lib/get-dictionary'
import { InfrastructureSection } from '@/components/sections/infrastructure-section'

export default async function InfrastructurePage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  return <InfrastructureSection dict={dict} lang={lang} />
}
