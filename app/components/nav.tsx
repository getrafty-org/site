'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { useSearch } from './hooks/use-search'
import { SearchOverlay } from './search-overlay'

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

  const search = useSearch({ posts })

  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
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
      {/* Left-aligned navigation buttons */}
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

      {/* Right-aligned mobile search button */}
      <ul className="navbar-links-right">
        <li>
          <button
            className="button mobile-search-button"
            onClick={search.open}
            aria-label="Search"
          >
            <a className="icon icon-search" aria-hidden="true"></a>
          </button>
        </li>
      </ul>

      {/* Desktop inline search */}
      <div
        className="navbar-center desktop-search"
        onMouseEnter={search.open}
        onMouseLeave={() => {
          if (!search.query) {
            search.close()
          }
        }}
      >
        <input
          type="search"
          className={`nav-search-inline ${search.isOpen ? 'visible' : ''}`}
          placeholder="Search..."
          value={search.query}
          onChange={(e) => search.setQuery(e.target.value)}
          onKeyDown={search.handleKeyDown}
          onFocus={search.open}
          autoComplete="off"
        />
      </div>

      {/* Mobile search input */}
      {search.isOpen && (
        <div className="mobile-search-container">
          <input
            type="search"
            className="mobile-search-input"
            placeholder="Search..."
            value={search.query}
            onChange={(e) => search.setQuery(e.target.value)}
            onKeyDown={search.handleKeyDown}
            autoFocus
            autoComplete="off"
          />
        </div>
      )}

      {/* Search overlay with results and blur effect */}
      <SearchOverlay
        isOpen={search.isOpen}
        query={search.query}
        filteredPosts={search.filteredPosts}
        selectedIndex={search.selectedIndex}
        onSelectIndex={search.setSelectedIndex}
        onClose={search.close}
      />
    </nav>
  )
}
