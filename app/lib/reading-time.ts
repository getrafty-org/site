const WORDS_PER_MINUTE = 200

export function getReadingTime(content: string): number {
  const text = content
    .replace(/```[\s\S]*?```/g, '') // remove code blocks
    .replace(/`[^`]*`/g, '')        // remove inline code
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // extract link text
    .replace(/[#*_~>`]/g, '')       // remove markdown symbols
    .trim()

  const words = text.split(/\s+/).filter(Boolean).length
  const minutes = Math.ceil(words / WORDS_PER_MINUTE)
  
  return Math.max(1, minutes)
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`
}
