import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CustomMDX } from 'app/components/mdx'
import Link from 'next/link'
import { formatDate, getBlogPosts } from 'app/blog/utils'
import { Footer } from 'app/components/footer'
import { TableOfContents } from 'app/components/toc'
import { extractHeadings } from 'app/lib/extract-headings'
import { getReadingTime, formatReadingTime } from 'app/lib/reading-time'

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

  const content = post.content ?? ''
  const headings = content ? extractHeadings(content) : []
  const readingTime = getReadingTime(content)

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
      <nav className="article-breadcrumb" aria-label="Breadcrumb">
        <Link href="/blog">Articles</Link>
        <span aria-hidden="true">/</span>
        <span>{post.metadata.title}</span>
      </nav>
      <h1 className="title text-4xl font-semibold tracking-tight mb-2 fg-base">
        {post.metadata.title}
      </h1>
      <div className="article-meta">
        <time dateTime={new Date(post.metadata.publishedAt).toISOString()}>
          {formatDate(post.metadata.publishedAt)}
        </time>
        <span className="article-meta-sep" aria-hidden="true">·</span>
        <span>{formatReadingTime(readingTime)}</span>
      </div>
      <TableOfContents entries={headings} />
      <article className="prose fg-body">
        <CustomMDX source={content} />
      </article>
      {post.slug === 'motto' && <Footer />}
    </section>
  )
}
