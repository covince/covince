import { useCallback, useMemo } from 'react'
import { sortBy } from 'lodash'

import useQueryAsState from './useQueryAsState'
import useNomenclature from './useNomenclature'

export default (uniqueLineages, { colors }) => {
  const [{ show }, updateQuery] = useQueryAsState()
  const { nomenclature, nomenclatureLookup } = useNomenclature()

  const queryLineages = useMemo(() =>
    new Set(show === undefined ? uniqueLineages : show.split(',').filter(_ => _.length))
  , [show])

  const activeLineages = useMemo(() => {
    return uniqueLineages.reduce((memo, lineage, index) => {
      memo[lineage] = {
        lineage,
        colour: colors[Array.isArray(colors) ? index : lineage],
        active: queryLineages.has(lineage),
        altName: nomenclatureLookup[lineage]
      }
      return memo
    }, {})
  }
  , [queryLineages])

  const sortedLineages = useMemo(() => {
    return [
      ...nomenclature.filter(({ lineage }) => lineage in activeLineages).map(({ lineage }) => activeLineages[lineage]),
      ...sortBy(Object.values(activeLineages).filter(_ => _.altName === undefined), 'lineage')
    ]
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
    toggleAll
  }
}
