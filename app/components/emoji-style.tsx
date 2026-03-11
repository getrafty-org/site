'use client'

import { useEffect } from 'react'

const emojiRegex = /(\p{Emoji_Presentation}|\p{Extended_Pictographic})/gu

export function EmojiStyle() {
  useEffect(() => {
    const wrapEmoji = () => {
      const walker = document.createTreeWalker(
        document.querySelector('.prose') || document.body,
        NodeFilter.SHOW_TEXT,
        null
      )

      const textNodes: Text[] = []
      let node: Text | null
      while ((node = walker.nextNode() as Text)) {
        if (emojiRegex.test(node.textContent || '')) {
          textNodes.push(node)
        }
        emojiRegex.lastIndex = 0
      }

      textNodes.forEach((textNode) => {
        const text = textNode.textContent || ''
        const parts = text.split(emojiRegex)
        
        if (parts.length <= 1) return

        const fragment = document.createDocumentFragment()
        parts.forEach((part) => {
          if (emojiRegex.test(part)) {
            const span = document.createElement('span')
            span.className = 'emoji'
            span.textContent = part
            span.setAttribute('role', 'img')
            fragment.appendChild(span)
          } else if (part) {
            fragment.appendChild(document.createTextNode(part))
          }
          emojiRegex.lastIndex = 0
        })

        textNode.parentNode?.replaceChild(fragment, textNode)
      })
    }

    const timer = setTimeout(wrapEmoji, 100)
    return () => clearTimeout(timer)
  }, [])

  return null
}
