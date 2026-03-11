import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { filterPostsByQuery, type BlogPost } from 'app/blog/post-helpers'
import { useRouter } from 'next/navigation'

interface UseSearchOptions {
  posts: BlogPost[]
  onToggle?: (isOpen: boolean) => void
}

export function useSearch({ posts, onToggle }: UseSearchOptions) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRefs = useRef<Set<HTMLInputElement>>(new Set())

  const focusInputs = useCallback(() => {
    const first = inputRefs.current.values().next().value
    first?.focus()
  }, [])

  const blurInputs = useCallback(() => {
    inputRefs.current.forEach((input) => input.blur())
  }, [])

  const focusInputsSoon = useCallback(() => {
    window.setTimeout(() => {
      focusInputs()
    }, 0)
  }, [focusInputs])

  const createInputBinder = useCallback(() => {
    let current: HTMLInputElement | null = null

    return (node: HTMLInputElement | null) => {
      if (current) {
        inputRefs.current.delete(current)
      }
      if (node) {
        inputRefs.current.add(node)
      }
      current = node
    }
  }, [])

  const filteredPosts = useMemo(() => {
    return query.trim() ? filterPostsByQuery(posts, query) : []
  }, [posts, query])

  // Reset selection whenever the search input or results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query, filteredPosts.length])


  // Global keyboard handlers
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // ESC to close search
      if (e.key === 'Escape') {
        setIsOpen(false)
        setQuery('')
        blurInputs()
        return
      }

      // Ignore if already in an input, textarea, or contenteditable
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsOpen(true)
        focusInputsSoon()
        return
      }

      if (e.key === '/') {
        e.preventDefault()
        setIsOpen(true)
        focusInputsSoon()
        return
      }

      // Ignore modifier keys, function keys, etc.
      if (
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.key.length > 1 // Ignore special keys like Arrow, Enter, etc.
      ) {
        return
      }

      if (e.key.trim() === '') {
        return
      }

      // Show search, preserve the first typed character, and focus the input.
      e.preventDefault()
      setIsOpen(true)
      setQuery((current) => current + e.key)
      focusInputsSoon()
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [blurInputs, focusInputsSoon])

  // Notify when search opens/closes
  useEffect(() => {
    onToggle?.(isOpen)
  }, [isOpen, onToggle])

  const open = () => {
    setIsOpen(true)
    focusInputsSoon()
  }

  const close = () => {
    setIsOpen(false)
    setQuery('')
    blurInputs()
    setSelectedIndex(0)
  }

  const clear = () => {
    setQuery('')
    setSelectedIndex(0)
    focusInputsSoon()
  }

  const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
  }

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' && filteredPosts.length) {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % filteredPosts.length)
    } else if (e.key === 'ArrowUp' && filteredPosts.length) {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filteredPosts.length) % filteredPosts.length)
    } else if (e.key === 'Enter' && filteredPosts[selectedIndex]) {
      e.preventDefault()
      router.push(`/blog/${filteredPosts[selectedIndex].slug}`)
      close()
    }
  }

  return {
    isOpen,
    query,
    filteredPosts,
    selectedIndex,
    setSelectedIndex,
    open,
    close,
    clear,
    inputBindings: {
      value: query,
      onChange: handleQueryChange,
      onKeyDown: handleKeyDown,
    },
    createInputBinder,
  }
}
