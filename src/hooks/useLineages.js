import { useEffect, useState, useMemo } from 'react'
import axios from 'axios'

import useQueryAsState from './useQueryAsState'

const getDefaultScale = (x) => {
  if (x === 'p') return 'linear'
  if (x === 'lambda') return 'quadratic'
  if (x === 'R') return undefined
}

const useLineages = () => {
  const [{ lineage, colorBy, scale }, updateQuery] = useQueryAsState({ lineage: 'B.1.1.7', colorBy: 'p' })
  const [current, setCurrent] = useState({ lineage: null, colorBy: null, data: null })

  const isLoading = useMemo(() =>
    lineage !== current.lineage ||
    colorBy !== current.colorBy
  , [current, lineage, colorBy])

  useEffect(() => {
    if (isLoading) {
      axios.get(`./data/lineage/${lineage}/${colorBy}.json`)
        .then(res => {
          setCurrent({
            ...current,
            data: res.data,
            lineage,
            colorBy
          })
        })
    }
  }, [isLoading])

  const actions = {
    setLineage: lineage => updateQuery({ lineage }),
    colorBy: colorBy => updateQuery({ colorBy, scale: undefined }),
    setScale: scale => updateQuery({ scale })
  }

  const results = useMemo(() => {
    if (current.data === null) {
      return null
    }

    const { dates, ltlas, values } = current.data

    let max = 0
    for (const row of values) {
      max = Math.max(max, ...row)
    }
    if (current.colorBy === 'p') max *= 100
    if (current.colorBy === 'R') max = 4
    if (current.colorBy === 'lambda') max = Math.min(max, 1000)

    const index = {}

    for (let i = 0; i < ltlas.length; i++) {
      const ltla = ltlas[i]
      const lookup = {}
      for (let j = 0; j < dates.length; j++) {
        const value = values[i][j]
        lookup[dates[j]] = current.colorBy === 'p' ? value * 100 : value
      }
      index[ltla] = lookup
    }

    return { min: 0, max, index, dates }
  }, [current.data])

  const state = useMemo(() => {
    return {
      ...current,
      scale: scale || getDefaultScale(current.colorBy),
      loading: {
        lineage,
        colorBy
      }
    }
  }, [current, lineage, colorBy, scale])

  return [state, actions, results]
}

export default useLineages
