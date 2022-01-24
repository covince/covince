import { useCallback, useMemo } from 'react'

import useQueryAsState from './useQueryAsState'
import useNomenclature from './useNomenclature'

const collator = new Intl.Collator(undefined, { numeric: true })

export default (uniqueLineages = [], loadedLineages = uniqueLineages, { colors }, darkMode) => {
  const [{ show }, updateQuery] = useQueryAsState()
  const { nomenclature, nomenclatureLookup } = useNomenclature()

  const queryLineages = useMemo(() =>
    new Set(show === undefined ? loadedLineages : show.split(',').filter(_ => _.length))
  , [show, loadedLineages])

  const activeLineages = useMemo(() => {
    return loadedLineages.reduce((memo, lineage, index) => {
      const colour = colors[Array.isArray(colors) ? index : lineage]
      const mutsIndex = lineage.indexOf('+')
      memo[lineage] = {
        lineage,
        colour: typeof colour === 'object' ? colour[darkMode ? 'dark' : 'light'] : colour,
        active: queryLineages.has(lineage),
        altName: mutsIndex !== -1 ? lineage.slice(0, mutsIndex) : nomenclatureLookup[lineage],
        label: mutsIndex !== -1 ? lineage.slice(mutsIndex) : undefined,
        nomenclatureIndex: nomenclature.findIndex(_ => _.lineage === lineage)
      }
      return memo
    }, {})
  }, [queryLineages, darkMode, colors])

  const sortedLineages = useMemo(() => {
    const lineagesWithNomenclature = []
    const lineagesWithoutNomenclature = []
    for (const item of Object.values(activeLineages)) {
      if (uniqueLineages.includes(item.lineage)) {
        (item.lineage in nomenclatureLookup ? lineagesWithNomenclature : lineagesWithoutNomenclature).push(item)
      }
    }
    lineagesWithNomenclature.sort((a, b) => {
      if (a.nomenclatureIndex > b.nomenclatureIndex) return 1
      if (a.nomenclatureIndex < b.nomenclatureIndex) return -1
      return 0
    })
    lineagesWithoutNomenclature.sort((a, b) => collator.compare(a.lineage, b.lineage))
    return [
      ...lineagesWithNomenclature,
      ...lineagesWithoutNomenclature
    ]
  }, [activeLineages, uniqueLineages])

  const allSelected = useMemo(
    () => queryLineages.size === loadedLineages.length,
    [queryLineages, loadedLineages]
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
