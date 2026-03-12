import type { Metadata } from 'next'
import Link from 'next/link'
import { formatDate, getBlogPosts } from 'app/blog/utils'
import { sortPostsByDateDesc } from 'app/blog/post-helpers'

export const metadata: Metadata = {
  title: 'Pages',
  description: 'Write-ups on distributed backend systems. Build fully functional tiny versions yourself.',
}

export default function BlogIndex() {
  const posts = sortPostsByDateDesc(getBlogPosts())

  return (
    <section>
      <h1 className="text-3xl font-semibold tracking-tight mb-8 fg-base">
        Pages
      </h1>
      <ul className="article-list">
        {posts.map((post) => (
          <li key={post.slug} className="article-list-item">
            <Link href={`/blog/${post.slug}`} className="article-list-link">
              <span className="article-list-title">{post.metadata.title}</span>
              <span className="article-list-summary">{post.metadata.summary}</span>
              <span className="article-list-date">{formatDate(post.metadata.publishedAt, false)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
