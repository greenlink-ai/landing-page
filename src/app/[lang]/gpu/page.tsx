import type { Locale } from '@/lib/i18n'
import { getDictionary } from '@/lib/get-dictionary'
import { GpuSection } from '@/components/sections/gpu-section'

export default async function GpuPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  return <GpuSection dict={dict} />
}
