'use client'

import Link from 'next/link'
import type { BlogPost } from 'app/blog/post-helpers'

interface SearchResultsProps {
  posts: BlogPost[]
  selectedIndex: number
  onSelectIndex: (index: number) => void
  onClose: () => void
}

export function SearchResults({ posts, selectedIndex, onSelectIndex, onClose }: SearchResultsProps) {
  if (posts.length === 0) {
    return <p className="nav-no-results">No matches found.</p>
  }

  return (
    <ul className="nav-search-results">
      {posts.slice(0, 5).map((post, index) => (
        <li key={post.slug}>
          <Link
            href={`/blog/${post.slug}`}
            className={index === selectedIndex ? 'selected' : ''}
            onClick={onClose}
            onMouseEnter={() => onSelectIndex(index)}
          >
            {post.metadata.title}
          </Link>
        </li>
      ))}
    </ul>
  )
}
