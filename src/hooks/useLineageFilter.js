import { useCallback, useMemo } from 'react'
import useNomenclature from './useNomenclature'
import { sortBy } from 'lodash'

import useQueryAsState from './useQueryAsState'

export default (uniqueLineages, colors) => {
  const [{ show }, updateQuery] = useQueryAsState()
  const { hasLineage, getName, nomenclature, schemes, setScheme } = useNomenclature(uniqueLineages)

  const queryLineages = useMemo(() =>
    new Set(show === undefined ? uniqueLineages : show.split(',').filter(_ => _.length))
  , [show])

  const activeLineages = useMemo(() => {
    const lineages = sortBy(
      uniqueLineages
        .map((lineage, index) => ({
          lineage,
          colour: colors[Array.isArray(colors) ? index : lineage],
          active: queryLineages.has(lineage),
          label: getName(lineage)
        }))
        .filter(_ => hasLineage(_.lineage)),
      'label'
    )

    return lineages.reduce((memo, { lineage, ...rest }) => {
      memo[lineage] = rest
      return memo
    }, {})
  }
  , [queryLineages, nomenclature])

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
    toggleAll,
    nomenclature,
    schemes,
    setScheme
  }
}
