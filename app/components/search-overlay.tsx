'use client'

import { SearchResults } from './search-results'
import type { BlogPost } from 'app/blog/post-helpers'

interface SearchOverlayProps {
  isOpen: boolean
  query: string
  filteredPosts: BlogPost[]
  selectedIndex: number
  onSelectIndex: (index: number) => void
  onClose: () => void
}

export function SearchOverlay({
  isOpen,
  query,
  filteredPosts,
  selectedIndex,
  onSelectIndex,
  onClose,
}: SearchOverlayProps) {
  if (!isOpen) return null

  return (
    <>
      {query && (
        <div className="nav-results-container">
          <SearchResults
            posts={filteredPosts}
            selectedIndex={selectedIndex}
            onSelectIndex={onSelectIndex}
            onClose={onClose}
          />
        </div>
      )}

      <div className="nav-dismiss-overlay" onClick={onClose} />
    </>
  )
}
