import type { Locale } from '@/lib/i18n'
import { getDictionary } from '@/lib/get-dictionary'
import { FeaturesSection } from '@/components/sections/features-section'

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  return <FeaturesSection dict={dict} />
}
