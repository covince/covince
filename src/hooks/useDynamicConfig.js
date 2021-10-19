import { expandLineage, toAlias } from 'pango-utils'
import { useMemo } from 'react'

import { colourPalette } from './useDynamicLineages'
import { createConfig } from '../config'

export const whoVariants = {
  'B.1.1.7': 'Alpha',
  'B.1.351': 'Beta',
  'B.1.1.28.1': 'Gamma',
  'B.1.617.2': 'Delta',
  'B.1.525': 'Eta',
  'B.1.526': 'Iota',
  'B.1.617.1': 'Kappa',
  'B.1.1.1.37': 'Lambda',
  'B.1.621': 'Mu'
}

const whoVariantEntries =
  Object.entries(whoVariants)
    .map(([lineage, variant]) => [`${lineage}.`, variant])

const collator = new Intl.Collator(undefined, { numeric: true })

const useDynamicConfig = ({ lineages, lineageToColourIndex, staticConfig }) => {
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
