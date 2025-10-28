import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CustomMDX } from 'app/components/mdx'
import { formatDate, getBlogPosts } from 'app/blog/utils'
import { Footer } from 'app/components/footer'

export async function generateStaticParams() {
  let posts = getBlogPosts()

  return posts.map((post) => ({
    slug: post.slug,
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
  let post = getBlogPosts().find((post) => post.slug === params.slug)

  if (!post) {
    notFound()
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
      <Footer year={new Date(post.metadata.publishedAt).getFullYear()} />
    </section>
  )
}
