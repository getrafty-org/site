import Link from 'next/link'
import { formatDate, getBlogPosts } from 'app/blog/utils'
import { sortPostsByDateDesc } from 'app/blog/post-helpers'

export function BlogPosts() {
  const posts = sortPostsByDateDesc(getBlogPosts())

  return (
    <ul className="list-none p-0 mt-8">
      {posts
        .map((post) => (
          <li key={post.slug} className="grid grid-cols-[minmax(10ch,auto)_minmax(0,1fr)_auto] items-baseline gap-5 mb-3.5">
            <span style={{ color: 'var(--color-dim)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
              {formatDate(post.metadata.publishedAt, false)}
            </span>
            <Link
              href={`/blog/${post.slug}`}
              className="no-underline text-sm hover:underline"
              style={{ color: 'var(--color-link)' }}
            >
              {post.metadata.title}
            </Link>
            <span></span>
          </li>
        ))}
    </ul>
  )
}
