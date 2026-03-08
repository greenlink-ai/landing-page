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
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@700,800&display=swap"
        />
        {/* Termly Consent Banner */}
        <script
          type="text/javascript"
          src="https://app.termly.io/resource-blocker/d50a0771-6a74-4b95-a3f4-bd57bb7135c3?autoBlock=on"
          async
        />
      </head>
      <body>
        <PostHogProvider>{children}</PostHogProvider>
      </body>
    </html>
  )
}
