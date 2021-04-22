import { useCallback, useMemo } from 'react'

import useQueryAsState from './useQueryAsState'

export default (uniqueLineages, colours) => {
  const [{ show }, updateQuery] = useQueryAsState()

  const queryLineages = useMemo(() =>
    new Set(show === undefined ? uniqueLineages : show.split(',').filter(_ => _.length))
  , [show])

  const activeLineages = useMemo(() =>
    uniqueLineages.reduce((memo, lineage, index) => {
      memo[lineage] = {
        colour: colours[index],
        active: queryLineages.has(lineage)
      }
      return memo
    }, {})
  , [queryLineages])

  const allSelected = useMemo(
    () => queryLineages.size === uniqueLineages.length,
    [queryLineages, uniqueLineages]
  )

  const toggleAll = useCallback(() => {
    if (allSelected) {
      updateQuery({ show: '' })
    } else {
      updateQuery({ show: uniqueLineages.join(',') })
    }
  }, [allSelected, uniqueLineages])

  return {
    activeLineages,
    toggleLineage: lineage => {
      queryLineages[queryLineages.has(lineage) ? 'delete' : 'add'](lineage)
      updateQuery({ show: Array.from(queryLineages).join(',') })
    },
    allSelected,
    toggleAll
  }
}
