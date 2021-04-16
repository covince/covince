import { useState, useEffect, useMemo } from 'react'
import { screens } from 'tailwindcss/defaultTheme'

const useMediaQuery = (mediaQuery) => {
  if (!(window && window.matchMedia)) {
    return false
  }

  const media = window.matchMedia(mediaQuery)

  const [isMatching, setMatching] = useState(media.matches)

  useEffect(() => {
    const listener = () => { setMatching(media.matches) }
    media.addEventListener('change', listener)
    return () => media.removeEventListener('change', listener)
  }, [])

  return isMatching
}

export const useScreen = (tailwindScreen) => {
  const mediaQuery = useMemo(
    () => `(min-width: ${screens[tailwindScreen]})`,
    [tailwindScreen]
  )
  return useMediaQuery(mediaQuery)
}

export const useMobile = () => {
  const matches = useScreen('md')
  return !matches
}

export default useMediaQuery
