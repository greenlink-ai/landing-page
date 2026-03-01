import type { Locale } from '@/lib/i18n'
import { getDictionary } from '@/lib/get-dictionary'
import { HeroSection } from '@/components/sections/hero-section'
import { ProductSection } from '@/components/sections/product-section'
import { FeaturesSection } from '@/components/sections/features-section'
import { UseCasesSection } from '@/components/sections/use-cases-section'
import { PricingSection } from '@/components/sections/pricing-section'
import { AboutSection } from '@/components/sections/about-section'
import { ContactSection } from '@/components/sections/contact-section'

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang: rawLang } = await params
  const lang = rawLang as Locale
  const dict = await getDictionary(lang)

  return (
    <>
      <HeroSection dict={dict} />
      <ProductSection dict={dict} />
      <FeaturesSection dict={dict} />
      <UseCasesSection dict={dict} />
      <PricingSection dict={dict} lang={lang} />
      <AboutSection dict={dict} />
      <ContactSection dict={dict} lang={lang} />
    </>
  )
}
