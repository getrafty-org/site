import { useEffect, useState } from 'react'

interface Post {
  slug: string
  metadata: {
    title: string
    publishedAt: string
    summary: string
  }
}

interface UseSearchOptions {
  posts: Post[]
  onToggle?: (isOpen: boolean) => void
}

export function useSearch({ posts, onToggle }: UseSearchOptions) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Filter posts based on search query
  const filteredPosts = query.trim()
    ? posts.filter((post) => {
        const q = query.toLowerCase()
        const title = post.metadata.title.toLowerCase()
        const summary = (post.metadata.summary || '').toLowerCase()
        return title.includes(q) || summary.includes(q)
      })
    : []

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Prevent body scroll when search is active
  useEffect(() => {
    if (query && isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [query, isOpen])

  // Global keyboard handlers
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // ESC to close search
      if (e.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
        // Remove focus from search input
        const searchInput = document.querySelector('.nav-search-inline, .mobile-search-input') as HTMLInputElement
        if (searchInput) {
          searchInput.blur()
        }
        return
      }

      // Ignore if already in an input, textarea, or contenteditable
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Ignore modifier keys, function keys, etc.
      if (
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.key.length > 1 // Ignore special keys like Arrow, Enter, etc.
      ) {
        return
      }

      // Show search and focus input on any key press
      setIsOpen(true)
      const searchInput = document.querySelector('.nav-search-inline') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  // Notify when search opens/closes
  useEffect(() => {
    onToggle?.(isOpen)
  }, [isOpen, onToggle])

  const open = () => {
    setIsOpen(true)
    // Focus search input after a short delay
    setTimeout(() => {
      const searchInput = document.querySelector('.nav-search-inline, .mobile-search-input') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      }
    }, 100)
  }

  const close = () => {
    setIsOpen(false)
    setQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' && filteredPosts.length) {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % filteredPosts.length)
    } else if (e.key === 'ArrowUp' && filteredPosts.length) {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filteredPosts.length) % filteredPosts.length)
    } else if (e.key === 'Enter' && filteredPosts[selectedIndex]) {
      e.preventDefault()
      window.location.href = `/blog/${filteredPosts[selectedIndex].slug}`
    }
  }

  return {
    isOpen,
    query,
    setQuery,
    filteredPosts,
    selectedIndex,
    setSelectedIndex,
    open,
    close,
    handleKeyDown,
  }
}
