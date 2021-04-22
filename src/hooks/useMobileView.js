import { useCallback } from 'react'
import useQueryAsState from './useQueryAsState'

export default (isMobile) => {
  const [{ view }, setQuery] = useQueryAsState({ view: 'chart' })

  const setView = useCallback(view => {
    window.scrollTo({ top: 0 })
    setQuery({ view })
  }, [setQuery])

  return [isMobile ? view : null, setView]
}
