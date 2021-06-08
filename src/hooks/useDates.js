import { useState, useEffect, useMemo, useCallback } from 'react'

import useQueryAState from '../hooks/useQueryAsState'

export default (datesList, { initial_date = datesList[datesList.length - 1], frame_length }) => {
  const [playing, setPlaying] = useState(false)
  const [query, updateQuery] = useQueryAState({ date: initial_date })
  const [date, setDate] = useState(query.date)

  useEffect(() => {
    if (query.date !== date) {
      setDate(query.date)
    }
  }, [query.date])

  const persistDate = useCallback((date, method) => updateQuery({ date }, method), [updateQuery])

  useEffect(() => {
    if (playing) {
      const timeout = setTimeout(() => {
        const cur_index = datesList.indexOf(date)
        if (cur_index === datesList.length - 1) {
          setPlaying(false)
          return
        }
        const set_to = datesList[cur_index + 1]
        persistDate(set_to, 'replace')
      }, frame_length)
      return () => clearTimeout(timeout)
    }
  }, [playing, date, datesList])

  const state = useMemo(() => ({
    date,
    playing
  }))

  const _setPlaying = useCallback((isPlaying) => {
    if (isPlaying && datesList.indexOf(date) === datesList.length - 1) {
      persistDate(datesList[0], 'replace')
    }
    setPlaying(isPlaying)
  }, [setPlaying, date, datesList])

  const actions = {
    setPlaying: _setPlaying,
    setDate,
    persistDate
  }

  return [state, actions]
}
