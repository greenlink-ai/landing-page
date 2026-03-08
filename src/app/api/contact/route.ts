import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/db'
import { leads } from '@/db/schema'

const contactSchema = z.object({
  fullName: z.string().min(2).max(255),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional(),
  company: z.string().max(255).optional(),
  needs: z.array(z.string()).min(1),
  message: z.string().min(1).max(5000),
  locale: z.enum(['pt', 'en']).default('pt'),
})

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json()
    const data = contactSchema.parse(body)

    await db.insert(leads).values({
      fullName: data.fullName,
      email: data.email,
      phone: data.phone,
      company: data.company,
      needs: data.needs,
      message: data.message,
      locale: data.locale,
    })

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
