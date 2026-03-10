import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { z } from 'zod'
import { db } from '@/db'
import { leads } from '@/db/schema'
import { getDictionary } from '@/lib/get-dictionary'
import type { Locale } from '@/lib/i18n'

const resend = new Resend(process.env.RESEND_API_KEY!)

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'

const contactSchema = z.object({
  fullName: z.string().min(2).max(255),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional(),
  company: z.string().max(255).optional(),
  needs: z.array(z.string()).min(1),
  message: z.string().min(1).max(5000),
  locale: z.enum(['pt', 'en']).default('pt'),
  turnstileToken: z.string().min(1),
})

async function verifyTurnstile(token: string): Promise<boolean> {
  const res = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    body: `secret=${encodeURIComponent(process.env.TURNSTILE_SECRET_KEY!)}&response=${encodeURIComponent(token)}`,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
  })
  const data = (await res.json()) as { success: boolean }
  return data.success
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json()
    const data = contactSchema.parse(body)

    const turnstileValid = await verifyTurnstile(data.turnstileToken)
    if (!turnstileValid) {
      return NextResponse.json(
        { success: false, error: 'Turnstile verification failed' },
        { status: 403 }
      )
    }

    await db.insert(leads).values({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      company: data.company,
      needs: data.needs,
      message: data.message,
      locale: data.locale,
    })

    const dict = await getDictionary(data.locale as Locale)
    const ce = dict.contact.confirmationEmail

    await Promise.all([
      // Notification to us
      resend.emails.send({
        from: 'GreenLink <noreply@greenlink.pt>',
        to: ['hello@greenlink.pt'],
        subject: `Novo contacto: ${data.fullName}`,
        template: {
          id: 'landing-page-income-message',
          variables: {
            full_name: data.fullName,
            email: data.email,
            phone: data.phone ?? '',
            company: data.company ?? '',
            needs: data.needs.join(', '),
            message: data.message,
          },
        },
      }),
      // Confirmation to the sender
      resend.emails.send({
        from: 'GreenLink <noreply@greenlink.pt>',
        to: [data.email],
        subject: ce.subject,
        template: {
          id: 'landing-page-form-auto-response',
          variables: {
            full_name: data.fullName,
            salutation: ce.salutation.replace('{{full_name}}', data.fullName),
            intro: ce.intro,
            context: ce.context,
            benefit: ce.benefit,
            sign_off: ce.signOff,
            team_name: ce.teamName,
            website_url: 'https://greenlink.pt',
            privacy_url: `https://greenlink.pt/${data.locale}/privacy`,
            privacy_label: ce.privacyLabel,
          },
        },
      }),
    ])

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, errors: error.flatten().fieldErrors },
        { status: 400 }
      )
    }
    console.error('[contact] Error inserting lead:', error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
