import type { Locale } from '@/lib/i18n'
import { getDictionary } from '@/lib/get-dictionary'
import { ContactSection } from '@/components/sections/contact-section'

export default async function ContactoPage({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  return <ContactSection dict={dict} lang={lang} />
}
