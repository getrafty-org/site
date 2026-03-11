'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  filterPostsByQuery,
  formatPublishedDate,
  sortPostsByDateDesc,
  type BlogPost,
} from 'app/blog/post-helpers'

interface SearchProps {
  posts: BlogPost[]
}

export function Search({ posts }: SearchProps) {
  const [query, setQuery] = useState('')

  const filteredPosts = useMemo(() => {
    const filtered = filterPostsByQuery(posts, query)
    return sortPostsByDateDesc(filtered)
  }, [query, posts])

  return (
    <section>
      <input
        type="search"
        className="w-full border mb-6 search-input"
        placeholder="Search articles by title or description..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search posts"
        autoComplete="off"
      />

      {filteredPosts.length > 0 ? (
        <ul className="list-none p-0">
          {filteredPosts.map((post) => (
            <li key={post.slug} className="grid grid-cols-[minmax(10ch,auto)_minmax(0,1fr)_auto] items-baseline gap-5 mb-3.5">
              <time
                className="whitespace-nowrap fg-dim text-sm"
                dateTime={new Date(post.metadata.publishedAt).toISOString()}
              >
                {formatPublishedDate(post.metadata.publishedAt, false)}
              </time>
              <Link
                href={`/blog/${post.slug}`}
                className="no-underline hover:underline fg-link text-sm"
              >
                {post.metadata.title}
              </Link>
              <span></span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="fg-dim">No matches found.</p>
      )}
    </section>
  )
}
