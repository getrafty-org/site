'use client'

import { useTheme } from 'next-themes'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useSearch } from './hooks/use-search'
import { SearchOverlay } from './search-overlay'
import { useIsMounted } from './hooks/use-is-mounted'
import type { BlogPost } from 'app/blog/post-helpers'
import Link from 'next/link'
import { MAX_SEARCH_RESULTS } from './search-constants'

import IconArticles from '@/icomoon/cube.svg'
import IconContrast from '@/icomoon/contrast.svg'
import IconEdit from '@/icomoon/pen.svg'
import IconSearch from '@/icomoon/search.svg'
import IconMenu from '@/icomoon/menu.svg'
import IconClose from '@/icomoon/cross.svg'
import IconClearCircle from '@/icomoon/cancel-circle.svg'

const SITE_REPO = 'https://github.com/getrafty-org/site'

function getEditUrl(pathname: string): string | null {
  const match = pathname.match(/^\/blog\/([^/]+)\/?$/)
  if (match) return `${SITE_REPO}/edit/main/app/blog/posts/${match[1]}.mdx`
  return null
}

function ClearButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      className="search-clear-btn"
      onClick={(e) => { e.stopPropagation(); onClick() }}
      aria-label="Clear search"
    >
      <IconClearCircle />
    </button>
  )
}

interface TocHeading {
  id: string
  text: string
  level: number
}

function useTocFromDom(isOpen: boolean): TocHeading[] {
  const [headings, setHeadings] = useState<TocHeading[]>([])

  useEffect(() => {
    if (!isOpen) return
    const els = document.querySelectorAll<HTMLElement>('article h2[id], article h3[id], article h4[id]')
    const items: TocHeading[] = []
    els.forEach((el) => {
      const level = parseInt(el.tagName[1], 10)
      items.push({ id: el.id, text: el.textContent || '', level })
    })
    setHeadings(items)
  }, [isOpen])

  return headings
}

interface NavbarProps {
  posts?: BlogPost[]
}

const hoverOpenDelayMs = 200

export function Navbar({ posts = [] }: NavbarProps) {
  const { theme, setTheme } = useTheme()
  const isMounted = useIsMounted()
  const pathname = usePathname()
  const hoverOpenTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null)
  const mobilePanelRef = useRef<HTMLDivElement | null>(null)
  const mobilePanelId = 'mobile-navigation-panel'

  const search = useSearch({ posts })
  const desktopInputRef = useMemo(() => search.createInputBinder(), [search.createInputBinder])
  const mobileInputRef = useMemo(() => search.createInputBinder(), [search.createInputBinder])

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolledDown, setScrolledDown] = useState(false)
  const tocHeadings = useTocFromDom(mobileMenuOpen)

  useEffect(() => {
    const onScroll = () => {
      setScrolledDown(window.scrollY > 60)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const editUrl = getEditUrl(pathname)

  const closeMobileMenu = useCallback(() => {
    setMobileMenuOpen(false)
    search.close()
  }, [search])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  useEffect(() => {
    if (!mobileMenuOpen) return
    const panel = mobilePanelRef.current
    if (!panel) return

    const getFocusable = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      )

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        closeMobileMenu()
        mobileMenuButtonRef.current?.focus()
        return
      }

      if (e.key !== 'Tab') return

      const focusable = getFocusable()
      if (!focusable.length) {
        e.preventDefault()
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    panel.addEventListener('keydown', handleKey)
    return () => panel.removeEventListener('keydown', handleKey)
  }, [mobileMenuOpen, closeMobileMenu])

  useEffect(() => {
    return () => {
      if (hoverOpenTimeoutRef.current) clearTimeout(hoverOpenTimeoutRef.current)
    }
  }, [])

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')

  if (!isMounted) {
    return (
      <nav className="navbar">
        <ul className="navbar-links">
          <li><Link href="/blog" className="button" aria-label="Articles"><IconArticles className="icon" /></Link></li>
          <li><button type="button" className="button" aria-label="Toggle theme"><IconContrast className="icon" /></button></li>
          <li>
            <button type="button" className="button" aria-label="Edit unavailable on this page" disabled>
              <IconEdit className="icon" />
            </button>
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
    if (search.isOpen || hoverOpenTimeoutRef.current) return
    hoverOpenTimeoutRef.current = setTimeout(() => {
      hoverOpenTimeoutRef.current = null
      search.open()
    }, hoverOpenDelayMs)
  }

  const handleMouseLeave = () => {
    cancelHoverOpen()
    if (!search.query) search.close()
  }

  const handleFocus = () => {
    cancelHoverOpen()
    search.open()
  }

  const sharedInputProps = {
    placeholder: 'Search...',
    autoComplete: 'off',
    'aria-label': 'Search articles',
    ...search.inputBindings,
  }

  return (
    <nav className="navbar">
      <ul className="navbar-links">
        <li><Link href="/blog" className="button" aria-label="Articles"><IconArticles className="icon" /></Link></li>
        <li>
          <button type="button" className="button" onClick={toggleTheme} aria-label="Toggle theme">
            <IconContrast className="icon" />
          </button>
        </li>
        <li>
          {editUrl ? (
            <a className="button" href={editUrl} target="_blank" rel="noopener noreferrer" aria-label="Edit this page">
              <IconEdit className="icon" />
            </a>
          ) : (
            <button type="button" className="button" aria-label="Edit unavailable on this page" disabled>
              <IconEdit className="icon" />
            </button>
          )}
        </li>
      </ul>

      <ul className="navbar-links-right">
        <li>
          <button
            ref={mobileMenuButtonRef}
            type="button"
            className="button mobile-menu-toggle"
            onClick={() => mobileMenuOpen ? closeMobileMenu() : setMobileMenuOpen(true)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls={mobilePanelId}
          >
            {mobileMenuOpen ? <IconClose className="icon" /> : <IconMenu className="icon" />}
          </button>
        </li>
      </ul>

      <div
        className={`navbar-center desktop-search ${scrolledDown && !search.isOpen ? 'navbar-hidden' : ''}`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div
          className={`search-field ${search.isOpen ? 'visible' : ''}`}
          onClick={() => { search.open() }}
        >
          <IconSearch className="search-icon" />
          <input
            type="search"
            className="nav-search-inline"
            {...sharedInputProps}
            onFocus={handleFocus}
            ref={desktopInputRef}
          />
          {search.query ? (
            <ClearButton onClick={search.clear} />
          ) : (
            <kbd className="search-shortcut" aria-hidden="true">⌘K</kbd>
          )}
        </div>
      </div>

      <SearchOverlay
        isOpen={search.isOpen && !mobileMenuOpen}
        query={search.query}
        filteredPosts={search.filteredPosts}
        selectedIndex={search.selectedIndex}
        onSelectIndex={search.setSelectedIndex}
        onClose={search.close}
      />

      {mobileMenuOpen && (
          <div
            id={mobilePanelId}
            ref={mobilePanelRef}
            className="mobile-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="mobile-panel-search">
              <div className="mobile-search-field">
                <IconSearch className="search-icon" />
                <input
                  type="search"
                  className="mobile-search-input"
                  {...sharedInputProps}
                  autoFocus
                  ref={mobileInputRef}
                />
                {search.query && <ClearButton onClick={search.clear} />}
              </div>
            </div>

            {search.query && search.filteredPosts.length > 0 ? (
              <ul className="mobile-panel-results">
                {search.filteredPosts.slice(0, MAX_SEARCH_RESULTS).map((post, index) => (
                  <li key={post.slug}>
                    <Link
                      href={`/blog/${post.slug}`}
                      className={index === search.selectedIndex ? 'selected' : ''}
                      onClick={closeMobileMenu}
                      onMouseEnter={() => search.setSelectedIndex(index)}
                    >
                      {post.metadata.title}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : search.query ? (
              <p className="mobile-panel-empty">No matches found.</p>
            ) : (
              <>
                <ul className="mobile-panel-nav">
                  <li><Link href="/blog" onClick={closeMobileMenu}>Articles</Link></li>
                  {editUrl && <li><a href={editUrl} target="_blank" rel="noopener noreferrer" onClick={closeMobileMenu}>Edit this page</a></li>}
                </ul>

                {tocHeadings.length > 0 && (
                  <>
                    <div className="mobile-panel-divider" />
                    <ul className="mobile-panel-toc">
                      {tocHeadings.map((h) => (
                        <li key={h.id}>
                          <a
                            href={`#${h.id}`}
                            className={h.level > 2 ? 'toc-indent' : ''}
                            onClick={closeMobileMenu}
                          >
                            {h.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </div>
      )}
    </nav>
  )
}
