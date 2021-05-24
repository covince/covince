
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

const config = {
  datetime_format: 'd MMMM y, HH:mm',
  colors: tolMutedQualitative,
  map: { settings: {} },
  timeline: {
    dateFormat: {
      heading: 'd MMMM y',
      mobile_nav: 'd MMMM y',
      chart_tooltip: 'd MMMM y'
    }
  }
}

let previousConfig

export const setConfig = (userConfig) => {
  // relying on immutability
  if (userConfig === previousConfig || userConfig === undefined) return
  previousConfig = userConfig

  // normalise options
  const { timeline = {} } = userConfig
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

  Object.assign(config, userConfig)
}

export default config
