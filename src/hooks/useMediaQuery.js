import { useState, useEffect, useMemo, useRef } from 'react'
import { screens } from 'tailwindcss/defaultTheme'

const useMediaQuery = (mediaQuery) => {
  if (!(window && window.matchMedia)) {
    return false
  }

  const mediaRef = useRef(window.matchMedia(mediaQuery))

  const [isMatching, setMatching] = useState(mediaRef.current.matches)

  useEffect(() => {
    const listener = () => { setMatching(mediaRef.current.matches) }
    mediaRef.current.addEventListener('change', listener)
    return () => mediaRef.current.removeEventListener('change', listener)
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
