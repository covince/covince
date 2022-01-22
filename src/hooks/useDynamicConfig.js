import { useMemo } from 'react'
import { expandLineage, whoVariants } from '../pango'

import useReverseAliasLookup from './useReverseAliasLookup'
import { createConfig } from '../config'

const whoVariantEntries =
  Object.entries(whoVariants)
    .map(([lineage, variant]) => [`${lineage}.`, variant])

const collator = new Intl.Collator(undefined, { numeric: true })

const useDynamicConfig = ({ colourPalette, lineages, lineageToColourIndex, staticConfig }) => {
  const toAlias = useReverseAliasLookup()

  const nomenclature = useMemo(() => {
    const whoIndex = {}
    const expanded = lineages.map(l => `${expandLineage(l)}.`)
    for (const [lineage, alt_name] of whoVariantEntries) {
      const matches = expanded.map((l, i) => l.startsWith(lineage) ? lineages[i] : '')
      matches.sort(collator.compare)
      for (const match of matches) {
        whoIndex[match] = alt_name
      }
    }
    const pangoItems = []
    for (const lineage of lineages) {
      if (lineage in toAlias && !(lineage in whoIndex)) {
        pangoItems.push({ lineage, alt_name: toAlias[lineage] })
      }
    }
    pangoItems.sort((a, b) => collator.compare(a.alt_name, b.alt_name))
    return [
      ...Object.entries(whoIndex).map(([lineage, alt_name]) => ({ lineage, alt_name })),
      ...pangoItems
    ]
  }, [lineages])

  return useMemo(() => {
    const _config = createConfig(staticConfig)
    _config.nomenclature = nomenclature
    _config.chart_tooltip = { use_nomenclature: false }

    _config.colors = {}
    for (const [lineage, colourIndex] of Object.entries(lineageToColourIndex)) {
      _config.colors[lineage] = colourPalette[colourIndex]
    }

    const { default_lineage } = _config.map.settings
    if (!lineages.includes(default_lineage)) {
      _config.map.settings.default_lineage = lineages[0]
    }

    return _config
  }, [lineageToColourIndex, staticConfig])
}

export default useDynamicConfig
