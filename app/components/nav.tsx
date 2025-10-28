'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Post {
  slug: string
  metadata: {
    title: string
    publishedAt: string
    summary: string
  }
}

interface NavbarProps {
  posts?: Post[]
}

export function Navbar({ posts = [] }: NavbarProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [showNav, setShowNav] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Auto-show search when user starts typing, ESC to close
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement

      // ESC to close search
      if (e.key === 'Escape') {
        setShowNav(false)
        setSearchQuery('')
        // Remove focus from search input
        const searchInput = document.querySelector('.nav-search-inline') as HTMLInputElement
        if (searchInput) {
          searchInput.blur()
        }
        return
      }

      // Ignore if already in an input, textarea, or contenteditable
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

      // Show nav and focus search on any key press
      setShowNav(true)
      const searchInput = document.querySelector('.nav-search-inline') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  const filteredPosts = searchQuery.trim()
    ? posts.filter((post) => {
        const q = searchQuery.toLowerCase()
        const title = post.metadata.title.toLowerCase()
        const summary = (post.metadata.summary || '').toLowerCase()
        return title.includes(q) || summary.includes(q)
      })
    : []

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [searchQuery])

  // Prevent body scroll when search is active
  useEffect(() => {
    if (searchQuery && showNav) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [searchQuery, showNav])

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
    // ESC is handled by the global handler, not here
  }

  if (!mounted) {
    return (
      <nav className="navbar">
        <ul className="navbar-links">
          <li>
            <button className="button theme-toggle">
              <a className="icon icon-magic" aria-hidden="true"></a>
            </button>
          </li>
          <li>
            <button className="button">
              <a
                className="icon icon-github"
                aria-hidden="true"
                href="https://github.com/getrafty-org/getrafty"
                target="_blank"
                rel="noopener noreferrer"
              ></a>
            </button>
          </li>
        </ul>
      </nav>
    )
  }

  return (
    <nav className="navbar">
      <ul className="navbar-links">
        <li>
          <button className="button theme-toggle" onClick={toggleTheme}>
            <a className="icon icon-magic" aria-hidden="true"></a>
          </button>
        </li>
        <li>
          <button className="button">
            <a
              className="icon icon-github"
              aria-hidden="true"
              href="https://github.com/getrafty-org/getrafty"
              target="_blank"
              rel="noopener noreferrer"
            ></a>
          </button>
        </li>
      </ul>

      {/* Center navigation area - inline with navbar */}
      <div
        className="navbar-center"
        onMouseEnter={() => setShowNav(true)}
        onMouseLeave={() => {
          // Keep open if there's a query or if search is focused
          if (!searchQuery) {
            setShowNav(false)
          }
        }}
      >
        <input
          type="search"
          className={`nav-search-inline ${showNav ? 'visible' : ''}`}
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowNav(true)}
          autoComplete="off"
        />
      </div>

      {/* Solid navbar background when search is active */}
      {showNav && <div className="navbar-center-bg" />}

      {/* Search results displayed on top of blurred background */}
      {searchQuery && showNav && (
        <div
          className="nav-results-container"
          onMouseLeave={() => {
            setShowNav(false)
            setSearchQuery('')
          }}
        >
          {filteredPosts.length > 0 ? (
            <ul className="nav-search-results">
              {filteredPosts.slice(0, 5).map((post, index) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className={index === selectedIndex ? 'selected' : ''}
                    onClick={() => {
                      setShowNav(false)
                      setSearchQuery('')
                    }}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    {post.metadata.title}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="nav-no-results">No matches found.</p>
          )}
        </div>
      )}

      {/* Blur overlay with gradient - click anywhere to close */}
      {showNav && (
        <div
          className="nav-blur-overlay"
          style={{
            '--gradient-start': searchQuery && filteredPosts.length > 0
              ? `calc(2rem + 2.5em + 1rem + ${Math.min(filteredPosts.length, 5)} * 2.5rem)`
              : 'calc(2rem + 2.5em + 1rem)',
          } as React.CSSProperties}
          onClick={() => {
            setShowNav(false)
            setSearchQuery('')
          }}
        />
      )}
    </nav>
  )
}
