import './global.css'
import './prism-theme.css'
import type { Metadata } from 'next'
import { Navbar } from './components/nav'
import { ThemeProvider } from './components/theme-provider'
import { baseUrl } from './config'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { getBlogPosts } from './blog/utils'

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: 'Getrafty',
    template: '%s | Getrafty',
  },
  description: 'Write-ups on distributed backend systems. Here, you\'ll have the opportunity to build a fully functional tiny version yourself.',
  keywords: 'distributed systems, backend systems, raft consensus algorithm, c++ exercises, rpc framework, distributed file systems, fault-tolerant systems, queues and thread pools, basic primitives, toy implementations of systems, distributed file server, remote procedure calls, distributed backend tutorials, contributing to distributed systems, basics of distributed systems, rafty exercises, getrafty, learn distributed systems, c++ exercises, file server exercises, scenes from distributed systems',
  authors: [{ name: 'Getrafty' }],
  creator: 'Getrafty',
  publisher: 'Getrafty',
  openGraph: {
    title: 'Getrafty',
    description: 'Write-ups on distributed backend systems. Build fully functional tiny versions yourself.',
    url: baseUrl,
    siteName: 'Getrafty',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Getrafty',
    description: 'Write-ups on distributed backend systems. Build fully functional tiny versions yourself.',
    creator: '@getrafty',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: baseUrl,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const posts = getBlogPosts()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="stylesheet" href="/static/icomoon.css" />
        <link rel="icon" href="/static/img/mascot-light.svg" type="image/svg+xml" />
        <link rel="icon" href="/static/img/mascot-light.svg" type="image/svg+xml" media="(prefers-color-scheme: light)" />
        <link rel="icon" href="/static/img/mascot-dark.svg" type="image/svg+xml" media="(prefers-color-scheme: dark)" />
      </head>
      <body>
        <ThemeProvider>
          <header>
            <Navbar posts={posts} />
          </header>
          <main>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
