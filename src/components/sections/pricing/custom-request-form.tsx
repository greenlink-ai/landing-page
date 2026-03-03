"use client"

import { useState } from "react"
import { Settings, Send } from "lucide-react"
import type { Dictionary } from "@/lib/get-dictionary"

interface CustomRequestFormProps {
  dict: Dictionary["pricing"]
}

export function CustomRequestForm({ dict }: CustomRequestFormProps) {
  const [message, setMessage] = useState("")
  const t = dict.customForm

  return (
    <div
      className="rounded-2xl border border-primary/20 bg-card/50 p-6 backdrop-blur-sm lg:p-8"
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

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            {t.label}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={t.placeholder}
            className="h-40 w-full resize-none rounded-lg border border-[rgba(255,255,255,0.06)] bg-background/50 p-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none focus:ring-1 focus:ring-primary/20"
          />
        </div>

        <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 text-sm font-semibold text-primary-foreground transition-all duration-200 hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25">
          <Send className="size-4" />
          {t.submit}
        </button>

        <p className="text-center text-xs text-muted-foreground">
          {t.disclaimer}
        </p>
      </div>
    </div>
  )
}
