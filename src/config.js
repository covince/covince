import { createContext, useContext } from 'react'

import { merge } from 'lodash'

// https://personal.sron.nl/~pault/
// light: muted qualitative, dark: light qualitative (w/ muted purple)
const defaultColours = [
  { light: '#CC6677', /* rose */ dark: '#FFAABB' /* pink */ },
  { light: '#332288', /* indigo */ dark: '#77AADD' /* light blue */ },
  { light: '#DDCC77', /* sand */ dark: '#EEDD88' /* light yellow */ },
  { light: '#117733', /* green */ dark: '#BBCC33' /* pear */ },
  { light: '#88CCEE', /* cyan */ dark: '#99DDFF' /* light cyan */ },
  { light: '#882255', /* wine */ dark: '#EE8866' /* orange */ },
  { light: '#44AA99', /* teal */ dark: '#44BB99' /* mint */ },
  { light: '#999933', /* olive */ dark: '#AAAA00' /* olive */ },
  { light: '#AA4499', /* purple */ dark: '#AA4499' },
  { light: '#DDDDDD', /* grey */ dark: '#DDDDDD' /* pale grey */ }
]

const defaults = {
  chart: {
    definitions: [],
    settings: {
      csv_download: true,
      tooltip: {
        use_nomenclature: true
      }
    }
  },
  datetime_format: 'd MMMM y, HH:mm',
  map: { settings: {} },
  timeline: {
    date_format: {
      heading: 'd MMMM y',
      mobile_nav: 'd MMMM y',
      chart_tooltip: 'd MMMM y'
    }
  },
  nomenclature: []
}

export const createConfig = (userConfig) => {
  const config = {}
  merge(config, defaults, userConfig)

  // normalise options
  const { map, timeline, colors, parameters, charts, chart_tooltip } = config
  if (typeof timeline.date_format === 'string') {
    timeline.date_format = {
      heading: timeline.date_format,
      mobile_nav: timeline.date_format,
      chart_tooltip: timeline.date_format
    }
  }
  if (typeof timeline.frame_length !== 'number') {
    timeline.frame_length = 100
  }
  if (typeof map.settings.default_color_by !== 'string') {
    map.settings.default_color_by = userConfig.parameters[0].id
  }
  if (typeof colors === 'undefined') {
    config.colors = defaultColours
  }
  for (const parameter of parameters) {
    if (typeof parameter.precision === 'number') {
      parameter.precision = {
        mean: parameter.precision,
        range: parameter.precision
      }
    }
  }
  if (typeof chart_tooltip === 'object') {
    config.chart.settings.tooltip = {
      ...chart_tooltip
    }
  }
  if (Array.isArray(charts)) {
    config.chart.definitions = charts
  }
  return config
}

export const ConfigContext = createContext(defaults)

export const useConfig = () => useContext(ConfigContext)
