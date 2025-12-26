import type { Metadata } from 'next'
import { Inter, Crimson_Text } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
})

const crimson = Crimson_Text({
  weight: ['400', '600', '700'],
  subsets: ['latin'],
  variable: '--font-crimson',
})

export const metadata: Metadata = {
  title: 'BibleMind - Biblical Holographic Reasoning Engine',
  description: 'Multi-perspective theological analysis grounded in Scripture. Get thoughtful biblical guidance powered by 10 parallel AI reasoning engines.',
  keywords: ['Bible', 'theology', 'AI', 'biblical guidance', 'Scripture', 'Christian', 'holographic reasoning'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${crimson.variable}`}>
      <body>{children}</body>
    </html>
  )
}
