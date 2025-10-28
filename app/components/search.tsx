'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Post {
  slug: string
  metadata: {
    title: string
    publishedAt: string
    summary: string
  }
}

interface SearchProps {
  posts: Post[]
}

function formatDate(date: string, includeRelative = false) {
  const d = new Date(date)
  const day = String(d.getUTCDate()).padStart(2, '0')
  const month = d.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' })
  const year = d.getUTCFullYear()
  return `${day} ${month}, ${year}`
}

export function Search({ posts }: SearchProps) {
  const [query, setQuery] = useState('')

  const filteredPosts = useMemo(() => {
    if (!query) return posts
    const q = query.trim().toLowerCase()
    if (!q) return posts
    return posts.filter((post) => {
      const title = (post.metadata.title || '').toLowerCase()
      const summary = (post.metadata.summary || '').toLowerCase()
      return title.includes(q) || summary.includes(q)
    })
  }, [query, posts])

  return (
    <section>
      <input
        type="search"
        className="w-full border mb-6"
        style={{
          background: 'transparent',
          borderColor: 'var(--color-line)',
          color: 'var(--color-base)',
          padding: '0.45rem 0.6rem',
          fontSize: '0.85rem',
          outline: 'none',
          borderRadius: 0
        }}
        onFocus={(e) => {
          e.target.style.boxShadow = '0 0 0 1px var(--color-line)'
        }}
        onBlur={(e) => {
          e.target.style.boxShadow = 'none'
        }}
        placeholder="Search articles by title or description..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search posts"
        autoComplete="off"
      />

      {filteredPosts.length > 0 ? (
        <ul className="list-none p-0">
          {filteredPosts
            .sort((a, b) => {
              if (
                new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
              ) {
                return -1
              }
              return 1
            })
            .map((post) => (
              <li key={post.slug} className="grid grid-cols-[minmax(10ch,auto)_minmax(0,1fr)_auto] items-baseline gap-5 mb-3.5">
                <time
                  className="whitespace-nowrap"
                  style={{ color: 'var(--color-dim)', fontSize: '0.9rem' }}
                  dateTime={new Date(post.metadata.publishedAt).toISOString()}
                >
                  {formatDate(post.metadata.publishedAt, false)}
                </time>
                <Link
                  href={`/blog/${post.slug}`}
                  className="no-underline hover:underline"
                  style={{ color: 'var(--color-link)', fontSize: '0.9rem' }}
                >
                  {post.metadata.title}
                </Link>
                <span></span>
              </li>
            ))}
        </ul>
      ) : (
        <p style={{ color: 'var(--color-dim)' }}>No matches found.</p>
      )}
    </section>
  )
}
