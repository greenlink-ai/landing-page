"use client"

import { Settings, ArrowDown } from "lucide-react"
import type { Dictionary } from "@/lib/get-dictionary"

interface CustomRequestCtaProps {
  dict: Dictionary["pricing"]
}

export function CustomRequestCta({ dict }: CustomRequestCtaProps) {
  const t = dict.customForm

  return (
    <div
      className="w-full rounded-2xl border border-primary/20 bg-card/50 p-6 backdrop-blur-sm lg:p-8"
      style={{ boxShadow: "0 0 40px 0 rgba(16, 185, 129, 0.1)" }}
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/5">
          <Settings className="size-5 text-primary" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-semibold text-foreground">{t.title}</h3>
      </div>

      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">{t.description}</p>

        <a
          href="#contact"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25"
        >
          <ArrowDown className="size-4" />
          {t.cta}
        </a>
      </div>
    </div>
  )
}
