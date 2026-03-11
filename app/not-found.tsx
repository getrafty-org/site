import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="not-found">
      <h1 className="not-found-title">404</h1>
      <p className="not-found-text">The page you are looking for does not exist.</p>
      <Link href="/blog" className="not-found-link">View all articles</Link>
    </section>
  )
}
