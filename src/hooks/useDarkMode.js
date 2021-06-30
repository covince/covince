import './dark-mode.css'

import { useMemo, useState, useEffect } from 'react'

import useMediaQuery from './useMediaQuery'

export default () => {
  // 'system', 'light', 'dark'
  const [mode, setMode] = useState(localStorage.mode || 'system')

  useEffect(() => {
    localStorage.mode = mode
  }, [mode])

  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)')
  const isDark = useMemo(() =>
    mode === 'system' ? prefersDark : mode === 'dark'
  , [mode, prefersDark])

  useEffect(() => {
    document.documentElement.classList[isDark ? 'add' : 'remove']('dark')
  }, [isDark])

  return {
    isDark,
    mode,
    setMode
  }
}
