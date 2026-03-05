import type { Locale } from '@/lib/i18n'
import { getDictionary } from '@/lib/get-dictionary'
import { UseCasesSection } from '@/components/sections/use-cases-section'

export default async function CasosDeUsoPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  return <UseCasesSection dict={dict} />
}
