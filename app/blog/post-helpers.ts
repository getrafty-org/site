export interface BlogPostMetadata {
  title: string
  publishedAt: string
  summary: string
  image?: string
  next?: string
  prev?: string
}

export interface BlogPost {
  slug: string
  metadata: BlogPostMetadata
  content?: string
}

export function sortPostsByDateDesc<T extends BlogPost>(posts: readonly T[]) {
  return [...posts].sort((a, b) => {
    const leftDate = new Date(a.metadata.publishedAt).getTime()
    const rightDate = new Date(b.metadata.publishedAt).getTime()

    return rightDate - leftDate
  })
}

export function filterPostsByQuery<T extends BlogPost>(posts: readonly T[], query: string) {
  const trimmedQuery = query.trim().toLowerCase()
  if (!trimmedQuery) {
    return [...posts]
  }

  return posts.filter((post) => {
    const title = post.metadata.title?.toLowerCase() ?? ''
    const summary = post.metadata.summary?.toLowerCase() ?? ''
    return title.includes(trimmedQuery) || summary.includes(trimmedQuery)
  })
}

export function formatPublishedDate(date: string, includeRelative = false) {
  const currentDate = new Date()
  const targetDate = new Date(date.includes('T') ? date : `${date}T00:00:00`)

  const yearsAgo = currentDate.getFullYear() - targetDate.getFullYear()
  const monthsAgo = currentDate.getMonth() - targetDate.getMonth()
  const daysAgo = currentDate.getDate() - targetDate.getDate()

  const fullDate = targetDate.toLocaleString('en-us', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  if (!includeRelative) {
    return fullDate
  }

  if (yearsAgo > 0) {
    return `${fullDate} (${yearsAgo}y ago)`
  }

  if (monthsAgo > 0) {
    return `${fullDate} (${monthsAgo}mo ago)`
  }

  if (daysAgo > 0) {
    return `${fullDate} (${daysAgo}d ago)`
  }

  return `${fullDate} (Today)`
}
