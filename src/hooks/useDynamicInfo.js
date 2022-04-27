import { createContext, useContext, useCallback } from 'react'
import { useQuery } from 'react-query'

export const InfoContext = createContext({})

export const useInfoQuery = (api_url) => {
  const getInfo = useCallback(async () => {
    const response = await fetch(`${api_url}/info`)
    const info = await response.json()
    info.dates.sort()
    return info
  }, [api_url])
  const { data } = useQuery('info', getInfo, { suspense: true })
  return data
}

export const useInfo = () => useContext(InfoContext)
