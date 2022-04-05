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
      const hasMuts = mutsIndex !== -1
      const muts = hasMuts ? lineage.slice(mutsIndex).split('+').slice(1) : null
      const mutsLabel = hasMuts
        ? muts.length === 1 ? `+ ${muts[0]}` : `+ ${muts.length} muts.`
        : null
      const pango = hasMuts ? lineage.slice(0, mutsIndex) : lineage
      const altName = hasMuts ? null : nomenclatureLookup[lineage]
      memo[lineage] = {
        active: queryLineages.has(lineage),
        altName,
        colour: typeof colour === 'object' ? colour[darkMode ? 'dark' : 'light'] : colour,
        label: altName
          ? `${altName} (${lineage})`
          : (mutsLabel ? `${pango} ${mutsLabel}` : lineage),
        lineage,
        nomenclatureIndex: nomenclature.findIndex(_ => _.lineage === pango),
        pango,
        primaryText: hasMuts ? pango : altName,
        secondaryText: mutsLabel || lineage,
        title: hasMuts ? muts.join(', ') : undefined
      }
      return memo
    }, {})
  }, [queryLineages, darkMode, colors])

  const sortedLineages = useMemo(() => {
    const lineagesWithNomenclature = []
    const lineagesWithoutNomenclature = []
    for (const item of Object.values(activeLineages)) {
      if (uniqueLineages.includes(item.lineage)) {
        (item.nomenclatureIndex !== -1
          ? lineagesWithNomenclature
          : lineagesWithoutNomenclature).push(item)
      }
    }
    lineagesWithNomenclature.sort((a, b) => {
      if (a.nomenclatureIndex > b.nomenclatureIndex) return 1
      if (a.nomenclatureIndex < b.nomenclatureIndex) return -1
      return collator.compare(a.lineage, b.lineage)
    })
    lineagesWithoutNomenclature.sort((a, b) => {
      if (a.pango === b.pango) {
        return a.lineage > b.lineage
      }
      return collator.compare(b.pango, a.pango)
    })
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
