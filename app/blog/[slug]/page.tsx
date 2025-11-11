import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CustomMDX } from 'app/components/mdx'
import Link from 'next/link'
import { formatDate, getBlogPosts } from 'app/blog/utils'
import { Footer } from 'app/components/footer'

export const dynamicParams = false

export function generateStaticParams() {
  const posts = getBlogPosts()

  return posts.map((post) => ({
    slug: String(post.slug),
  }))
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>
}): Promise<Metadata | undefined> {
  const params = await props.params
  let post = getBlogPosts().find((post) => post.slug === params.slug)
  if (!post) {
    return
  }

  let {
    title,
    publishedAt: publishedTime,
    summary: description,
  } = post.metadata

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime,
      url: `https://getrafty.org/blog/${post.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export default async function Blog(props: {
  params: Promise<{ slug: string }>
}) {
  const params = await props.params
  const posts = getBlogPosts()
  const post = posts.find((item) => item.slug === params.slug)

  if (!post) {
    notFound()
  }

  const previousPost = post.metadata.prev
    ? posts.find((item) => item.slug === post.metadata.prev)
    : undefined
  const nextPost = post.metadata.next
    ? posts.find((item) => item.slug === post.metadata.next)
    : undefined

  const backLink = previousPost
    ? {
      href: `/blog/${previousPost.slug}`,
      label: previousPost.metadata.title,
    }
    : {
      href: '/',
      label: 'Home',
    }

  const nextLink = nextPost &&
  {
    href: `/blog/${nextPost.slug}`,
    label: nextPost.metadata.title,
  }


  return (
    <section>
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.metadata.title,
            datePublished: post.metadata.publishedAt,
            dateModified: post.metadata.publishedAt,
            description: post.metadata.summary,
            url: `https://getrafty.org/blog/${post.slug}`,
            author: {
              '@type': 'Organization',
              name: 'Getrafty',
              url: 'https://getrafty.org',
            },
            publisher: {
              '@type': 'Organization',
              name: 'Getrafty',
              url: 'https://getrafty.org',
            },
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://getrafty.org/blog/${post.slug}`,
            },
            inLanguage: 'en-US',
          }),
        }}
      />
      <h1 className="title text-4xl font-semibold tracking-tight mb-2" style={{ color: 'var(--color-base)' }}>
        {post.metadata.title}
      </h1>
      <div className="flex justify-between items-center mt-2 mb-8 text-sm" style={{ color: 'var(--color-dim)' }}>
        <p>
          {formatDate(post.metadata.publishedAt)}
        </p>
      </div>
      <article className="prose" style={{ color: 'var(--color-text)' }}>
        <CustomMDX source={post.content} />
      </article>
      <nav
        className="mt-12"
        style={{ borderTop: '1px solid var(--color-line)', paddingTop: '1.5rem' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 text-sm">
          <Link
            href={backLink.href}
            className="flex items-center gap-2 leading-snug"
            style={{ color: 'var(--color-link)' }}
          >
            <span aria-hidden>←</span>
            <span>{backLink.label}</span>
          </Link>

          {nextLink && <Link
            href={nextLink.href}
            className="flex items-center gap-2 leading-snug ml-auto text-right justify-end"
            style={{ color: 'var(--color-link)' }}
          >
            <span>{nextLink.label}</span>
            <span aria-hidden>→</span>
          </Link>}

        </div>
      </nav>
      <Footer />
    </section>
  )
}
