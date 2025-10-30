'use client'

import { useTheme } from 'next-themes'
import { useEffect, useRef, useState } from 'react'
import { useSearch } from './hooks/use-search'
import { SearchOverlay } from './search-overlay'
import { gitUrl } from 'app/config'

import IconMagic from '@/icomoon/magic.svg'
import IconSearch from '@/icomoon/search.svg'
import IconGit from '@/icomoon/github.svg'


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

const hoverOpenDelayMs = 200

export function Navbar({ posts = [] }: NavbarProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const hoverOpenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useSearch({ posts })

  useEffect(() => {
    setMounted(true)

    return () => {
      if (hoverOpenTimeoutRef.current) {
        clearTimeout(hoverOpenTimeoutRef.current)
      }
    }
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  if (!mounted) {
    return (
      <nav className="navbar">
        <ul className="navbar-links">
          <li>
            <button className="button theme-toggle" aria-label="Toggle theme">
              <IconMagic className="icon" aria-hidden="true" focusable="false" />
            </button>
          </li>
          <li>
            <a
              className="button"
              href={gitUrl}
              target="_blank"
            >
              <IconGit className="icon" aria-hidden="true" focusable="false" />
            </a>
          </li>
        </ul>
      </nav>
    )
  }

  const cancelHoverOpen = () => {
    if (hoverOpenTimeoutRef.current) {
      clearTimeout(hoverOpenTimeoutRef.current)
      hoverOpenTimeoutRef.current = null
    }
  }

  const handleMouseEnter = () => {
    if (search.isOpen || hoverOpenTimeoutRef.current) {
      return
    }

    hoverOpenTimeoutRef.current = setTimeout(() => {
      hoverOpenTimeoutRef.current = null
      search.open()
    }, hoverOpenDelayMs)
  }

  const handleMouseLeave = () => {
    cancelHoverOpen()

    if (!search.query) {
      search.close()
    }
  }

  const handleFocus = () => {
    cancelHoverOpen()
    search.open()
  }

  return (
    <nav className="navbar">
      <ul className="navbar-links">
        <li>
          <button
            className="button theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            <IconMagic className="icon" aria-hidden="true" focusable="false" />
          </button>
        </li>
        <li>
          <a
            className="button"
            href={gitUrl}
            target="_blank"
          >
            <IconGit className="icon" aria-hidden="true" focusable="false" />
          </a>

        </li>
      </ul>

      <ul className="navbar-links-right">
        <li>
          <button
            className="button mobile-search-button"
            onClick={search.open}
            aria-label="Search"
          >
            <IconSearch className="icon" aria-hidden="true" focusable="false" />
          </button>
        </li>
      </ul>

      <div
        className="navbar-center desktop-search"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <input
          type="search"
          className={`nav-search-inline ${search.isOpen ? 'visible' : ''}`}
          placeholder="Search..."
          value={search.query}
          onChange={(e) => search.setQuery(e.target.value)}
          onKeyDown={search.handleKeyDown}
          onFocus={handleFocus}
          autoComplete="off"
        />
      </div>

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
