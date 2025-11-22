'use client'

import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useIsMounted } from './hooks/use-is-mounted'
import { useMemo } from 'react'

export function Logo() {
  const { theme } = useTheme()
  const isMounted = useIsMounted()

  const light = useMemo(() => {
    return (
      <Image
        src={'/static/img/mascot-light.svg'}
        alt="Getrafty mascot"
        width={120}
        height={120}
        priority
      />
    )
  }, []);

  const dark = useMemo(() => {
    return (
      <Image
        src={'/static/img/mascot-dark.svg'}
        alt="Getrafty mascot"
        width={120}
        height={120}
        priority
      />
    )
  }, []);


  const logo = isMounted && theme === 'dark'
    ? dark
    : light

  return logo;
}
