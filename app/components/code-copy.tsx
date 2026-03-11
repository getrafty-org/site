'use client'

import { useEffect } from 'react'

export function CodeCopyButton() {
  useEffect(() => {
    const handleClick = async (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.classList.contains('copy-button')) return

      const pre = target.closest('pre')
      if (!pre) return

      const code = pre.querySelector('code')
      if (!code) return

      try {
        await navigator.clipboard.writeText(code.textContent || '')
        target.classList.add('copied')
        target.setAttribute('aria-label', 'Copied!')
        
        setTimeout(() => {
          target.classList.remove('copied')
          target.setAttribute('aria-label', 'Copy code')
        }, 2000)
      } catch {
        // Fallback for older browsers
        const selection = window.getSelection()
        const range = document.createRange()
        range.selectNodeContents(code)
        selection?.removeAllRanges()
        selection?.addRange(range)
        document.execCommand('copy')
        selection?.removeAllRanges()
      }
    }

    const addCopyButtons = () => {
      const codeBlocks = document.querySelectorAll('pre:not(.has-copy-button)')
      
      codeBlocks.forEach((pre) => {
        pre.classList.add('has-copy-button')
        
        const wrapper = document.createElement('div')
        wrapper.className = 'code-block-wrapper'
        pre.parentNode?.insertBefore(wrapper, pre)
        wrapper.appendChild(pre)
        
        const button = document.createElement('button')
        button.className = 'copy-button'
        button.setAttribute('type', 'button')
        button.setAttribute('aria-label', 'Copy code')
        button.innerHTML = `
          <svg class="copy-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        `
        wrapper.appendChild(button)
      })
    }

    addCopyButtons()
    document.addEventListener('click', handleClick)
    
    const observer = new MutationObserver(addCopyButtons)
    observer.observe(document.body, { childList: true, subtree: true })

    return () => {
      document.removeEventListener('click', handleClick)
      observer.disconnect()
    }
  }, [])

  return null
}
