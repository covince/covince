import { useState, useEffect } from 'react'
import tailwind from 'tailwindcss/defaultTheme'

const mediaQuery = `(min-width: ${tailwind.screens.md})`

const useMobile = () => {
  if (!(window && window.matchMedia)) {
    return false
  }

  const media = window.matchMedia(mediaQuery)

  const [isMobile, setMobile] = useState(!media.matches)

  useEffect(() => {
    const listener = () => { setMobile(!media.matches) }
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])

  return isMobile
}

export default useMobile
