import type { Dictionary } from "@/lib/get-dictionary"

interface CookiePolicySectionProps {
  dict: Dictionary
}

interface CookieInfo {
  name: string
  purpose: string
  provider: string
  service: string
  serviceUrl: string
  type: string
  expiresIn: string
}

export function CookiePolicySection({ dict }: CookiePolicySectionProps) {
  const t = dict.cookiePolicy

  const cookies: CookieInfo[] = t.cookies as unknown as CookieInfo[]

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
          <p>{t.introPersonalInfo}</p>
        </div>

        {/* What are cookies */}
        <h2 className="mt-12 font-cabinet text-2xl font-bold text-[#09090b]">
          {t.whatAreCookiesTitle}
        </h2>
        <div className="mt-4 space-y-4 font-geist text-base leading-relaxed text-[#3f3f46]">
          <p>{t.whatAreCookiesBody}</p>
          <p>{t.whatAreCookiesTypes}</p>
        </div>

        {/* Why do we use cookies */}
        <h2 className="mt-12 font-cabinet text-2xl font-bold text-[#09090b]">
          {t.whyWeUseCookiesTitle}
        </h2>
        <p className="mt-4 font-geist text-base leading-relaxed text-[#3f3f46]">
          {t.whyWeUseCookiesBody}
        </p>

        {/* How can I control cookies */}
        <h2 className="mt-12 font-cabinet text-2xl font-bold text-[#09090b]">
          {t.howToControlTitle}
        </h2>
        <div className="mt-4 space-y-4 font-geist text-base leading-relaxed text-[#3f3f46]">
          <p>{t.howToControlBody}</p>
          <p>{t.howToControlDetails}</p>
        </div>

        {/* Cookie table */}
        <h3 className="mt-10 font-cabinet text-lg font-bold text-[#09090b]">
          {t.analyticsCookiesTitle}
        </h3>
        <p className="mt-2 font-geist text-sm leading-relaxed text-[#71717a]">
          {t.analyticsCookiesDescription}
        </p>

        <div className="mt-6 space-y-4">
          {cookies.map((cookie) => (
            <div
              key={cookie.name}
              className="overflow-hidden rounded-lg border border-[#e4e4e7] bg-white"
            >
              <div className="px-5 py-4">
                <table className="w-full text-sm">
                  <tbody className="divide-y divide-[#f4f4f5]">
                    <tr>
                      <th className="w-28 py-1.5 pr-3 text-right align-top font-medium text-[#09090b]">
                        {t.cookieTableHeaders.name}
                      </th>
                      <td className="py-1.5 text-[#71717a]">{cookie.name}</td>
                    </tr>
                    <tr>
                      <th className="py-1.5 pr-3 text-right align-top font-medium text-[#09090b]">
                        {t.cookieTableHeaders.purpose}
                      </th>
                      <td className="py-1.5 text-[#71717a]">
                        {cookie.purpose}
                      </td>
                    </tr>
                    <tr>
                      <th className="py-1.5 pr-3 text-right align-top font-medium text-[#09090b]">
                        {t.cookieTableHeaders.provider}
                      </th>
                      <td className="py-1.5 text-[#71717a]">
                        {cookie.provider}
                      </td>
                    </tr>
                    <tr>
                      <th className="py-1.5 pr-3 text-right align-top font-medium text-[#09090b]">
                        {t.cookieTableHeaders.service}
                      </th>
                      <td className="py-1.5 text-[#71717a]">
                        {cookie.service}{" "}
                        <a
                          href={cookie.serviceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
                        >
                          {t.viewPrivacyPolicy}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <th className="py-1.5 pr-3 text-right align-top font-medium text-[#09090b]">
                        {t.cookieTableHeaders.type}
                      </th>
                      <td className="py-1.5 text-[#71717a]">{cookie.type}</td>
                    </tr>
                    <tr>
                      <th className="py-1.5 pr-3 text-right align-top font-medium text-[#09090b]">
                        {t.cookieTableHeaders.expiresIn}
                      </th>
                      <td className="py-1.5 text-[#71717a]">
                        {cookie.expiresIn}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {/* Browser controls */}
        <h2 className="mt-12 font-cabinet text-2xl font-bold text-[#09090b]">
          {t.browserControlTitle}
        </h2>
        <p className="mt-4 font-geist text-base leading-relaxed text-[#3f3f46]">
          {t.browserControlBody}
        </p>
        <ul className="mt-4 list-inside list-disc space-y-1.5 font-geist text-base text-[#3f3f46]">
          {(t.browsers as { name: string; url: string }[]).map((browser) => (
            <li key={browser.name}>
              <a
                href={browser.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
              >
                {browser.name}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-4 font-geist text-base leading-relaxed text-[#3f3f46]">
          {t.adNetworksBody}
        </p>
        <ul className="mt-4 list-inside list-disc space-y-1.5 font-geist text-base text-[#3f3f46]">
          {(t.adNetworks as { name: string; url: string }[]).map((network) => (
            <li key={network.name}>
              <a
                href={network.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 underline underline-offset-2 hover:text-emerald-700"
              >
                {network.name}
              </a>
            </li>
          ))}
        </ul>

        {/* Web beacons */}
        <h2 className="mt-12 font-cabinet text-2xl font-bold text-[#09090b]">
          {t.webBeaconsTitle}
        </h2>
        <p className="mt-4 font-geist text-base leading-relaxed text-[#3f3f46]">
          {t.webBeaconsBody}
        </p>

        {/* Flash cookies */}
        <h2 className="mt-12 font-cabinet text-2xl font-bold text-[#09090b]">
          {t.flashCookiesTitle}
        </h2>
        <div className="mt-4 space-y-4 font-geist text-base leading-relaxed text-[#3f3f46]">
          <p>{t.flashCookiesBody1}</p>
          <p>{t.flashCookiesBody2}</p>
          <p>{t.flashCookiesBody3}</p>
        </div>

        {/* Targeted advertising */}
        <h2 className="mt-12 font-cabinet text-2xl font-bold text-[#09090b]">
          {t.targetedAdTitle}
        </h2>
        <p className="mt-4 font-geist text-base leading-relaxed text-[#3f3f46]">
          {t.targetedAdBody}
        </p>

        {/* Updates */}
        <h2 className="mt-12 font-cabinet text-2xl font-bold text-[#09090b]">
          {t.updatesTitle}
        </h2>
        <div className="mt-4 space-y-4 font-geist text-base leading-relaxed text-[#3f3f46]">
          <p>{t.updatesBody}</p>
          <p>{t.updatesDate}</p>
        </div>

        {/* Contact */}
        <h2 className="mt-12 font-cabinet text-2xl font-bold text-[#09090b]">
          {t.contactTitle}
        </h2>
        <p className="mt-4 font-geist text-base leading-relaxed text-[#3f3f46]">
          {t.contactBody}
        </p>
      </div>
    </section>
  )
}
