import { useCallback, useMemo } from 'react'
import { sortBy } from 'lodash'

import useQueryAsState from './useQueryAsState'
import { useRoulette, pangoToWHO } from './useWHONames'

export default (uniqueLineages, colors) => {
  const [{ show }, updateQuery] = useQueryAsState()

  const queryLineages = useMemo(() =>
    new Set(show === undefined ? uniqueLineages : show.split(',').filter(_ => _.length))
  , [show])

  const activeLineages = useMemo(() => {
    return uniqueLineages.reduce((memo, lineage, index) => {
      memo[lineage] = {
        lineage,
        colour: colors[Array.isArray(colors) ? index : lineage],
        active: queryLineages.has(lineage),
        who: pangoToWHO[lineage]
        // who: pangoToWHO[lineage] || (lineage === 'other' ? null : { name: 'Omicron' })
      }
      return memo
    }, {})
  }
  , [queryLineages])

  const sortedLineages = useMemo(() => {
    return sortBy(Object.values(activeLineages), ['who.sort', 'lineage'])
  }, [activeLineages])

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
    sortedLineages,
    toggleLineage: lineage => {
      queryLineages[queryLineages.has(lineage) ? 'delete' : 'add'](lineage)
      updateQuery({ show: Array.from(queryLineages).join(',') })
    },
    allSelected,
    toggleAll,
    ...useRoulette()
  }
}
