import type { Locale } from '@/lib/i18n'
import { getDictionary } from '@/lib/get-dictionary'
import { WhySectionLong } from '@/components/sections/why-section-long'

export default async function WhySectionLongPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  return <WhySectionLong dict={dict} />
}
