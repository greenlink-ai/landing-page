import type { Locale } from '@/lib/i18n'
import { getDictionary } from '@/lib/get-dictionary'
import { HeroSection } from '@/components/sections/hero-section'
import { WhyNowSection } from '@/components/sections/why-now-section'
import { HowItWorksSection } from '@/components/sections/how-it-works-section'
import { PricingSection } from '@/components/sections/pricing'
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
    <div className="relative">
      <HeroSection dict={dict} />
      <WhyNowSection dict={dict} lang={lang} />
      <HowItWorksSection dict={dict} />
      <AboutSection dict={dict} />
      <PricingSection dict={dict} />
      <ContactSection dict={dict} lang={lang} />
    </div>
  )
}
