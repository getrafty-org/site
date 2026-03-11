import Link from 'next/link'

export function Footer({ year }: { year?: number }) {
  const displayYear = year || new Date().getFullYear()

  return (
    <footer className="site-footer">
      <span className="site-footer-copy">
        {'©'} {displayYear} Getrafty
      </span>
      <span className="site-footer-sep" aria-hidden="true">·</span>
      <a
        href="https://github.com/getrafty-org/getrafty/blob/main/LICENSE"
        target="_blank"
        rel="noopener noreferrer"
        className="site-footer-link"
      >
        MIT License
      </a>
      <span className="site-footer-sep" aria-hidden="true">·</span>
      <Link href="/blog" className="site-footer-link">Articles</Link>
    </footer>
  )
}
