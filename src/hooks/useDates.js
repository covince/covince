import { useState, useEffect, useMemo, useCallback } from 'react'

import useQueryAState from '../hooks/useQueryAsState'

export default (datesList, initialDate) => {
  const [playing, setPlaying] = useState(false)
  const [query, updateQuery] = useQueryAState({ date: initialDate })
  const [date, setDate] = useState(query.date)

  useEffect(() => {
    if (query.date !== date) {
      setDate(query.date)
    }
  }, [query.date])

  useEffect(() => {
    if (playing) {
      const timeout = setTimeout(() => {
        let cur_index = datesList.indexOf(date)
        if (datesList[cur_index + 1] === undefined) {
          cur_index = -1
        }
        const set_to = datesList[cur_index + 1]
        setDate(set_to)
      }, 100)
      return () => clearTimeout(timeout)
    }
  }, [playing, date])

  const state = useMemo(() => ({
    date,
    playing
  }))

  const persistDate = useCallback(() => updateQuery({ date }), [updateQuery, date])

  const actions = {
    setPlaying,
    setDate,
    persistDate
  }

  return [state, actions]
}
