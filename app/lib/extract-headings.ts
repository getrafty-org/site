import { slugify } from './slugify'

export interface TocEntry {
  level: number
  text: string
  slug: string
}

export function extractHeadings(markdown: string): TocEntry[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm
  const entries: TocEntry[] = []
  let match: RegExpExecArray | null

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length
    const raw = match[2].trim()
    const text = raw.replace(/[`*_~[\]]/g, '')
    entries.push({ level, text, slug: slugify(text) })
  }

  return entries
}
