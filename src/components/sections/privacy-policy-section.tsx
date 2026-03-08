import Link from "next/link"
import type { Dictionary } from "@/lib/get-dictionary"

interface PrivacyPolicySectionProps {
  dict: Dictionary
  lang: string
}

interface PolicySection {
  title: string
  paragraphs: string[]
}

interface ThirdParty {
  category: string
  providers: string
}

export function PrivacyPolicySection({ dict, lang }: PrivacyPolicySectionProps) {
  const t = dict.privacyPolicy

  const sections = t.sections as unknown as PolicySection[]
  const thirdParties = t.thirdParties as unknown as ThirdParty[]

  return (
    <section className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8 lg:py-28">
        {/* Title */}
        <h1 className="font-cabinet text-4xl font-extrabold tracking-tight text-[#09090b] sm:text-5xl">
          {t.title}
        </h1>
        <p className="mt-3 text-sm font-medium text-[#71717a]">
          {t.lastUpdated}
        </p>

        {/* Intro */}
        <div className="mt-10 space-y-4 font-geist text-base leading-relaxed text-[#3f3f46]">
          <p>{t.intro}</p>
          <p>{t.serviceDescription}</p>
          <p>{t.engageWith}</p>
          <p>
            {t.questionsIntro}{" "}
            <a
              href="mailto:privacy@greenlink.pt"
              className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
            >
              privacy@greenlink.pt
            </a>
            .
          </p>
        </div>

        {/* Summary of Key Points */}
        <h2 className="mt-12 font-cabinet text-2xl font-bold text-[#09090b]">
          {t.summaryTitle}
        </h2>
        <p className="mt-4 font-geist text-base leading-relaxed text-[#3f3f46]">
          {t.summaryIntro}
        </p>
        <ul className="mt-4 list-inside list-disc space-y-3 font-geist text-base text-[#3f3f46]">
          {(t.summaryPoints as string[]).map((point, i) => (
            <li key={i} className="leading-relaxed">{point}</li>
          ))}
        </ul>

        {/* Table of Contents */}
        <h2 className="mt-12 font-cabinet text-2xl font-bold text-[#09090b]">
          {t.tocTitle}
        </h2>
        <ol className="mt-4 list-inside list-decimal space-y-1.5 font-geist text-base text-emerald-600">
          {(t.tocItems as string[]).map((item, i) => (
            <li key={i}>
              <a
                href={`#privacy-section-${i + 1}`}
                className="underline underline-offset-2 hover:text-emerald-700"
              >
                {item}
              </a>
            </li>
          ))}
        </ol>

        {/* Numbered sections */}
        {sections.map((section, i) => (
          <div key={i} id={`privacy-section-${i + 1}`} className="scroll-mt-24">
            <h2 className="mt-12 font-cabinet text-2xl font-bold text-[#09090b]">
              {i + 1}. {section.title}
            </h2>
            <div className="mt-4 space-y-4 font-geist text-base leading-relaxed text-[#3f3f46]">
              {section.paragraphs.map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>

            {/* Third parties list (inside section 4) */}
            {i === 3 && thirdParties.length > 0 && (
              <div className="mt-6 space-y-3">
                {thirdParties.map((tp) => (
                  <div
                    key={tp.category}
                    className="overflow-hidden rounded-lg border border-[#e4e4e7] bg-white px-5 py-3"
                  >
                    <span className="text-sm font-medium text-[#09090b]">
                      {tp.category}
                    </span>
                    <span className="ml-2 text-sm text-[#71717a]">
                      {tp.providers}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Cookie notice link (inside section 5) */}
            {i === 4 && (
              <p className="mt-4 font-geist text-base leading-relaxed text-[#3f3f46]">
                {t.cookieNoticeRef}{" "}
                <Link
                  href={`/${lang}/cookie-policy`}
                  className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
                >
                  {t.cookieNoticeLink}
                </Link>
              </p>
            )}
          </div>
        ))}

        {/* Contact address */}
        <div className="mt-8 rounded-lg border border-[#e4e4e7] bg-white px-5 py-4 font-geist text-sm leading-relaxed text-[#3f3f46]">
          <p className="font-medium text-[#09090b]">{t.companyName}</p>
          <p>{t.companyAddress}</p>
        </div>
      </div>
    </section>
  )
}
