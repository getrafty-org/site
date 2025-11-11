'use client'

import { useTheme } from 'next-themes'
import { useEffect, useMemo, useRef } from 'react'
import { useSearch } from './hooks/use-search'
import { SearchOverlay } from './search-overlay'
import { gitUrl } from 'app/config'
import { useIsMounted } from './hooks/use-is-mounted'
import type { BlogPost } from 'app/blog/post-helpers'

import IconMagic from '@/icomoon/magic-wand.svg'
import IconSearch from '@/icomoon/search.svg'
import IconGit from '@/icomoon/github1.svg'

interface NavbarProps {
  posts?: BlogPost[]
}

const hoverOpenDelayMs = 200

export function Navbar({ posts = [] }: NavbarProps) {
  const { theme, setTheme } = useTheme()
  const isMounted = useIsMounted()
  const hoverOpenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = useSearch({ posts })
  const desktopInputRef = useMemo(
    () => search.createInputBinder(),
    [search.createInputBinder],
  )
  const mobileInputRef = useMemo(
    () => search.createInputBinder(),
    [search.createInputBinder],
  )

  useEffect(() => {
    return () => {
      if (hoverOpenTimeoutRef.current) {
        clearTimeout(hoverOpenTimeoutRef.current)
      }
    }
  }, [])

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light')
  }

  if (!isMounted) {
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

  const sharedInputProps = {
    placeholder: 'Search...',
    autoComplete: 'off',
    ...search.inputBindings,
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
          {...sharedInputProps}
          onFocus={handleFocus}
          ref={desktopInputRef}
        />
      </div>

      {search.isOpen && (
        <div className="mobile-search-container">
          <input
            type="search"
            className="mobile-search-input"
            {...sharedInputProps}
            autoFocus
            ref={mobileInputRef}
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
