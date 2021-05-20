import { useState, useEffect, useMemo, useCallback } from 'react'

import useQueryAState from '../hooks/useQueryAsState'

export default (datesList, { initial_date, frame_length }) => {
  const [playing, setPlaying] = useState(false)
  const [query, updateQuery] = useQueryAState({ date: initial_date })
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
      }, frame_length)
      return () => clearTimeout(timeout)
    }
  }, [playing, date])

  const state = useMemo(() => ({
    date,
    playing
  }))

  const persistDate = useCallback((date) => updateQuery({ date }), [updateQuery])

  const actions = {
    setPlaying,
    setDate,
    persistDate
  }

  return [state, actions]
}
