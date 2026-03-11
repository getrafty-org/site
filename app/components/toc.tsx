'use client'

import { useEffect, useRef, useState } from 'react'
import type { TocEntry } from 'app/lib/extract-headings'

interface TocProps {
  entries: TocEntry[]
}

export function TableOfContents({ entries }: TocProps) {
  const [activeSlug, setActiveSlug] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    if (!entries.length) return

    const slugs = entries.map((e) => e.slug)
    const headingEls = slugs
      .map((s) => document.getElementById(s))
      .filter(Boolean) as HTMLElement[]

    if (!headingEls.length) return

    observerRef.current = new IntersectionObserver(
      (ioEntries) => {
        for (const entry of ioEntries) {
          if (entry.isIntersecting) {
            setActiveSlug(entry.target.id)
            break
          }
        }
      },
      { rootMargin: '-80px 0px -65% 0px', threshold: 0 },
    )

    headingEls.forEach((el) => observerRef.current!.observe(el))

    return () => observerRef.current?.disconnect()
  }, [entries])

  if (entries.length < 2) return null

  return (
    <nav className="toc" aria-label="Table of contents">
      <ul className="toc-list">
        {entries.map((entry) => (
          <li key={entry.slug}>
            <a
              href={`#${entry.slug}`}
              className={`toc-link ${entry.level > 2 ? 'toc-indent' : ''} ${activeSlug === entry.slug ? 'toc-active' : ''}`}
              aria-current={activeSlug === entry.slug ? 'location' : undefined}
            >
              {entry.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
