import { Logo } from 'app/components/logo'
import { Footer } from 'app/components/footer'
import Link from 'next/link'
import { baseUrl } from './config'

export default function Page() {

  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: 'Getrafty',
            description: 'Getrafty is an attempt to make those big, intimidating distributed systems feel small and approachable again. Step by step, no black boxes, no hand-waving, just code you can run, break, and understand.',
            url: baseUrl,
            inLanguage: 'en-US',
            publisher: {
              '@type': 'Organization',
              name: 'Getrafty',
              url: baseUrl,
            },
          }),
        }}
      />
      <div className="flex flex-col items-center text-center mb-8">
        <Logo />
        <h1 className="mb-1 text-4xl font-semibold tracking-tight" style={{ color: 'var(--color-base)' }}>
          Getrafty
        </h1>
        <p className="mb-4" style={{ color: 'var(--color-dim)', fontSize: '1.1rem' }}>
          Back to the internals.
        </p>
      </div>


      <div className="mb-8" style={{ color: 'var(--color-text)' }}>
        <p className="mb-4">
          Getrafty is an attempt to make those big, intimidating distributed systems feel small and
          approachable again. Step by step, no black boxes, no hand-waving, just code you
          can run, break, and understand.
        </p>
        <p className="mb-6">
          Ready?{' '}
          <Link href="/blog/about" style={{ color: 'var(--color-link)' }}>
            Start here
          </Link>
          {' '}to explore.
        </p>
      </div>
      <Footer />
    </section>
  )
}
