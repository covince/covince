import { merge } from 'lodash'

// https://personal.sron.nl/~pault/
const tolMutedQualitative = [
  '#332288', // indigo
  '#88CCEE', // cyan
  '#44AA99', // teal
  '#117733', // green
  '#999933', // olive
  '#DDCC77', // sand
  '#CC6677', // rose
  '#882255', // wine
  '#AA4499', // purple
  '#DDDDDD' // grey
]

const defaults = {
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

let config
let previousConfig

export const setConfig = (userConfig) => {
  // relying on immutability
  if (userConfig === previousConfig || userConfig === undefined) return
  previousConfig = userConfig

  config = {}
  merge(config, defaults, userConfig)

  // normalise options
  const { map, timeline, colors, parameters } = config
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
    config.colors = tolMutedQualitative
  }
  for (const parameter of parameters) {
    if (typeof parameter.precision === 'number') {
      parameter.precision = {
        mean: parameter.precision,
        range: parameter.precision
      }
    }
  }
}

export default () => config
