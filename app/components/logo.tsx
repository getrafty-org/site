'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import Image from 'next/image'

export function Logo() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const logoSrc = mounted && theme === 'dark'
    ? '/static/img/mascot-dark.svg'
    : '/static/img/mascot-light.svg'

  return (
    <Image
      src={logoSrc}
      alt="Getrafty mascot"
      width={120}
      height={120}
      priority
    />
  )
}
