import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent } from 'react'
import { filterPostsByQuery, type BlogPost } from 'app/blog/post-helpers'

interface UseSearchOptions {
  posts: BlogPost[]
  onToggle?: (isOpen: boolean) => void
}

export function useSearch({ posts, onToggle }: UseSearchOptions) {
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

  // Prevent body scroll when search is active
  useEffect(() => {
    if (query && isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [query, isOpen])

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

      // Ignore modifier keys, function keys, etc.
      if (
        e.ctrlKey ||
        e.metaKey ||
        e.altKey ||
        e.key.length > 1 // Ignore special keys like Arrow, Enter, etc.
      ) {
        return
      }

      // Show search and focus input on any key press
      setIsOpen(true)
      focusInputs()
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [blurInputs, focusInputs])

  // Notify when search opens/closes
  useEffect(() => {
    onToggle?.(isOpen)
  }, [isOpen, onToggle])

  const open = () => {
    setIsOpen(true)
    // Focus search input after a short delay
    setTimeout(() => {
      focusInputs()
    }, 100)
  }

  const close = () => {
    setIsOpen(false)
    setQuery('')
    blurInputs()
    setSelectedIndex(0)
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
      window.location.href = `/blog/${filteredPosts[selectedIndex].slug}`
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
    inputBindings: {
      value: query,
      onChange: handleQueryChange,
      onKeyDown: handleKeyDown,
    },
    createInputBinder,
  }
}
