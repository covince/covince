import { useCallback, useMemo } from 'react'

import useQueryAsState from './useQueryAsState'
import useNomenclature from './useNomenclature'

const collator = new Intl.Collator(undefined, { numeric: true })

export default (uniqueLineages = [], { colors }, darkMode) => {
  const [{ show }, updateQuery] = useQueryAsState()
  const { nomenclature, nomenclatureLookup } = useNomenclature()

  const queryLineages = useMemo(() =>
    new Set(show === undefined ? uniqueLineages : show.split(',').filter(_ => _.length))
  , [show, uniqueLineages])

  const activeLineages = useMemo(() => {
    return uniqueLineages.reduce((memo, lineage, index) => {
      const colour = colors[Array.isArray(colors) ? index : lineage]
      memo[lineage] = {
        lineage,
        colour: typeof colour === 'object' ? colour[darkMode ? 'dark' : 'light'] : colour,
        active: queryLineages.has(lineage),
        altName: nomenclatureLookup[lineage]
      }
      return memo
    }, {})
  }
  , [queryLineages, darkMode, colors])

  const sortedLineages = useMemo(() => {
    const lineagesWithoutAltNames = Object.values(activeLineages).filter(_ => _.altName === undefined)
    lineagesWithoutAltNames.sort((a, b) => collator.compare(a.lineage, b.lineage))
    return [
      ...nomenclature.filter(({ lineage }) => lineage in activeLineages).map(({ lineage }) => activeLineages[lineage]),
      ...lineagesWithoutAltNames
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
