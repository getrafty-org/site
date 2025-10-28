export function Footer({ year }: { year?: number }) {
  const displayYear = year || new Date().getFullYear()

  return (
    <footer className="mt-16 text-left" style={{ color: 'var(--color-dim)', fontSize: '0.9rem' }}>
      <p>
      {'©'} {displayYear}{' '}
        <a
          href="https://github.com/getrafty-org/getrafty/blob/main/LICENSE"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--color-dim)' }}
        >
          MIT License 
        </a>
      </p>
    </footer>
  )
}
