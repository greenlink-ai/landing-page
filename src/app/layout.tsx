import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { PostHogProvider } from '@/components/providers/posthog-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Greenlink',
  description: 'Sovereign AI Infrastructure, powered by NVIDIA Blackwell.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <head>
        <meta name="apple-mobile-web-app-title" content="Greenlink" />
      </head>
      <body>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  )
}
