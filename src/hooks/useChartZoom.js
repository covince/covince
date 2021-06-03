import useQueryAsState from './useQueryAsState'

export default () => {
  const [{ xMin, xMax }, updateQuery] = useQueryAsState()

  return {
    chartZoom: (xMin && xMax) ? [xMin, xMax] : null,
    setChartZoom: (xMin, xMax) => updateQuery({ xMin, xMax }),
    clearChartZoom: () => updateQuery({ xMin: undefined, xMax: undefined })
  }
}
