'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useIsMounted } from './hooks/use-is-mounted'

export function Logo() {
  const { theme } = useTheme()
  const isMounted = useIsMounted()

  const logoSrc = isMounted && theme === 'dark'
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
