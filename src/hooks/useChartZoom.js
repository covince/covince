import useQueryAsState from './useQueryAsState'

export default () => {
  const [{ xMin, xMax }, updateQuery] = useQueryAsState()

  return {
    xMin,
    xMax,
    chartZoomApplied: xMin && xMax,
    setChartZoom: (xMin, xMax) => updateQuery({ xMin, xMax }),
    clearChartZoom: () => updateQuery({ xMin: undefined, xMax: undefined })
  }
}
