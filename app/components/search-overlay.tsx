'use client'

import { SearchResults } from './search-results'

interface Post {
  slug: string
  metadata: {
    title: string
    publishedAt: string
    summary: string
  }
}

interface SearchOverlayProps {
  isOpen: boolean
  query: string
  filteredPosts: Post[]
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
      <div className="navbar-center-bg" />

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

      <div
        className="nav-blur-overlay"
        style={{
          '--gradient-start':
            query && filteredPosts.length > 0
              ? `calc(2rem + 2.5em + 1rem + ${Math.min(filteredPosts.length, 5)} * 2.5rem)`
              : 'calc(2rem + 2.5em + 1rem)',
        } as React.CSSProperties}
        onClick={onClose}
      />
    </>
  )
}
