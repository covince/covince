import './MultiLinePlot.css'

import React, { useMemo, useState } from 'react'
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ComposedChart, Area, ReferenceArea } from 'recharts'
import format from 'date-fns/format'
import * as tailwindColors from 'tailwindcss/colors'
import classNames from 'classnames'
import { orderBy } from 'lodash'

import ChartTooltip from './ChartTooltip'

import useChartZoom from '../hooks/useChartZoom'
import { useConfig } from '../config'

const animationDuration = 500
const fallbackColour = '#DDDDDD'

const MainChart = React.memo((props) => {
  const {
    activeLineages,
    chart,
    chartZoom,
    darkMode,
    precision,
    preset,
    stroke,
    tooltipEnabled,
    type,
    xAxisProps,
    yAxisConfig = {},
    zoomArea,
    ...chartProps
  } = props

  const { lineages, data, dates } = chart

  const yAxisDomain = useMemo(() => {
    if (yAxisConfig && yAxisConfig.domain) {
      return yAxisConfig.domain
    }
    if (preset === 'percentage' && type === 'area' && lineages.length === Object.keys(activeLineages).length) {
      return [0, 100]
    }
    if (chartZoom && data.length) {
      if (type === 'area') {
        const [minIndex, maxIndex] = xAxisProps.domain
        const range = data.slice(minIndex, maxIndex + 1)
        let { sumY: max } = range[0]
        for (const { sumY } of range.slice(1)) {
          max = Math.max(sumY, max)
        }
        return [0, Math.ceil(max)]
      } else {
        const [minIndex, maxIndex] = xAxisProps.domain
        const range = data.slice(minIndex, maxIndex + 1)
        let { maxY: max } = range[0]
        for (const { maxY } of range.slice(1)) {
          max = Math.max(maxY, max)
        }
        return [0, Math.ceil(max)]
      }
    }
    if (preset === 'percentage' && type === 'area' && lineages.length) {
      return [0, 1]
    }
    return [0, 'auto']
  }, [preset, type, yAxisConfig, lineages, xAxisProps.domain, data])

  const yAxisTicks = useMemo(() => {
    if (preset === 'percentage') {
      if (lineages.length === 0) {
        return { ticks: false }
      }
      const fullScale = lineages.length === Object.keys(activeLineages).length
      if (fullScale) {
        return {
          tickFormatter: value => `${Math.min(parseFloat(value), 100)}%`,
          ticks: chartZoom ? undefined : [0, 25, 50, 75, 100]
        }
      }
      return {
        tickFormatter: value => {
          if (value === 0) return '0%'
          if (value >= 100) return '100%'
          if (!Number.isInteger(value)) return `${value.toFixed(1)}%`
          return `${value}%`
        }
      }
    }
    return {
      tickFormatter: value => {
        if (value >= 10e3) {
          return `${value.toString().slice(0, 2)}K`
        }
        return value.toLocaleString()
      },
      ticks: chartZoom ? undefined : yAxisConfig.ticks
    }
  }, [preset, lineages, activeLineages, yAxisConfig, chartZoom])

  const grid =
    <CartesianGrid stroke={tailwindColors[stroke][darkMode ? 500 : 300]} />

  const [highlightedLineage, setHighlightedLineage] = useState(null)
  const tooltip = useMemo(() =>
    tooltipEnabled
      ? <Tooltip
          content={ChartTooltip}
          cursor={{ stroke: tailwindColors[stroke][darkMode ? 300 : 400] }}
          dates={dates}
          percentage={preset === 'percentage'}
          precision={precision}
          sortByValue={type !== 'area'}
          highlightedItem={highlightedLineage}
        />
      : null
  , [tooltipEnabled, stroke, dates, preset, precision, highlightedLineage, type])

  const xAxis = useMemo(() =>
    <XAxis
      {...xAxisProps}
      fontSize='12'
      tick={data.length}
      tickFormatter={i => i in data ? format(new Date(data[i].date), 'd MMM') : ''}
      tickMargin='4'
      stroke='currentcolor'
    />
  , [data, xAxisProps])

  const yAxis =
    <YAxis
      type='number'
      allowDataOverflow={chartZoom || yAxisConfig.allow_data_overflow || false}
      domain={yAxisDomain}
      width={48}
      stroke='currentcolor'
      tickMargin='4'
      tick={data.length}
      allowDecimals={false}
      {...yAxisTicks}
    />

  const areas = useMemo(() => {
    if (type === 'area') {
      return lineages.map(({ lineage, colour = fallbackColour }) => (
        <Area
          key={lineage}
          activeDot={{ stroke: tailwindColors[stroke][400] }}
          dataKey={lineage}
          dot={false}
          fill={colour}
          fillOpacity={highlightedLineage === lineage ? 0.8 : undefined}
          name={lineage}
          stackId='1'
          stroke={colour}
          type='monotone'
          animationDuration={animationDuration}
          isAnimationActive={true}
          onMouseEnter={({ name }) => { setHighlightedLineage(name) }}
          onMouseLeave={() => { setHighlightedLineage(null) }}
        />
      ))
    }
    return lineages
      .filter(_ => _.average !== 0)
      .map(({ lineage, colour = fallbackColour }) => {
        const key = `${lineage}_range`
        return (
          <Area
            key={key}
            activeDot={false}
            dataKey={key}
            fill={colour}
            name='_range'
            strokeWidth={0}
            type='monotone'
            animationDuration={animationDuration}
            isAnimationActive={true}
          />
        )
      })
  }, [lineages, stroke, type, highlightedLineage])

  const lines = useMemo(() => {
    if (type === 'area') return null
    return lineages.map(({ lineage, colour = fallbackColour }) =>
      <Line
        key={lineage}
        activeDot={{ stroke: tailwindColors[stroke][400] }}
        dataKey={lineage}
        dot={false}
        name={lineage}
        stroke={colour}
        type='monotone'
        animationDuration={animationDuration}
        isAnimationActive={true}
      />
    )
  }, [lineages, stroke, type])

  const yReference = useMemo(() => {
    if (yAxisConfig.reference_line === undefined) return null
    return (
      <ReferenceLine
        y={yAxisConfig.reference_line}
        stroke={tailwindColors[stroke][darkMode ? 400 : 600]}
        strokeDasharray={[8, 8]}
        label=''
        strokeWidth={2}
        style={{ mixBlendMode: darkMode ? 'screen' : 'multiply' }}
      />
    )
  }, [yAxisConfig.reference_line, stroke])

  return (
    <ComposedChart
      {...chartProps}
      data={[...data] /* new array required for animations */}
    >
      {grid}
      {areas}
      {xAxis}
      {yAxis}
      {tooltip}
      {yReference}
      {lines}
      {zoomArea.start !== undefined
        ? <ReferenceArea x1={zoomArea.start} x2={zoomArea.end} strokeOpacity={0.3} />
        : null}
    </ComposedChart>
  )
})
MainChart.displayName = 'MainChart'

const MultiLinePlot = props => {
  const {
    activeLineages,
    area_data,
    className,
    darkMode,
    date,
    height = 120,
    parameter,
    preset: deprecatedPreset,
    setDate,
    stroke = 'blueGray',
    tooltipEnabled,
    type,
    width,
    /* xAxis: xAxisConfig = {}, */
    yAxis: yAxisConfig,
    zoomEnabled
  } = props

  const { chartZoom, setChartZoom, clearChartZoom } = useChartZoom()

  const config = useConfig()
  const parameterConfig = useMemo(() => config.parameters.find(_ => _.id === parameter), [parameter])

  const preset = useMemo(() => {
    if (parameterConfig && parameterConfig.format === 'percentage') return 'percentage'

    // back compat
    if (deprecatedPreset) return deprecatedPreset
    if (parameter === 'p') return 'percentage'

    return null
  }, [parameter, deprecatedPreset])

  const precision = useMemo(() => {
    return parameterConfig ? parameterConfig.precision : undefined
  }, [parameter])

  const chart = useMemo(() => {
    const dataByDate = {}
    const lineageSum = {}

    for (const d of area_data) {
      if (d.parameter === parameter && d.lineage !== 'total') {
        const next = {
          ...dataByDate[d.date],
          date: d.date,
          [d.lineage]: d.mean,
          [`${d.lineage}_range`]: d.range
        }
        if (d.lineage in activeLineages && activeLineages[d.lineage].active) {
          next.maxY = Math.max(next.maxY || 0, d.range[1] || d.mean)
          next.sumY = (next.sumY || 0) + d.mean
        }
        dataByDate[d.date] = next
        const sum = lineageSum[d.lineage] || 0
        lineageSum[d.lineage] = (sum + d.mean)
      }
    }

    const data =
      orderBy(Object.values(dataByDate), 'date', 'asc')
        .map((d, index) => ({ ...d, index }))

    const dates = data.map(_ => _.date)

    const lineages = []
    for (const lineage of Object.keys(lineageSum)) {
      const { active, colour } = activeLineages[lineage]
      if (active) {
        lineages.push({ lineage, colour, average: lineageSum[lineage] / dates.length })
      }
    }

    const ordered = orderBy(lineages, 'average', 'asc')
    const sorted = []
    // group colours together
    while (ordered.length > 0) {
      const [item] = ordered.splice(0, 1)
      if (sorted.includes(item)) continue
      sorted.push(item)
      for (let i = 0; i < ordered.length; i++) {
        const other = ordered[i]
        if (item.colour === other.colour) {
          sorted.push(other)
        }
      }
    }

    return {
      lineages: sorted,
      data,
      dates
    }
  }, [area_data, activeLineages])

  const { data, dates } = chart

  const chartProps = useMemo(() => ({
    width,
    height,
    margin: { top: 12, left: 0, right: 24 }
  }), [width, height])

  const xAxisDomain = useMemo(() => {
    const minIndex = 0
    const maxIndex = data.length - 1
    if (chartZoom && dates.length) {
      const [minDate, maxDate] = chartZoom
      const min = Math.max(dates.indexOf(minDate), minIndex)
      let max = dates.indexOf(maxDate)
      if (max === -1) max = maxIndex
      return min < max ? [min, max] : [max, min]
    }
    return [minIndex, maxIndex]
  }, [chartZoom, dates])

  const xAxisProps = useMemo(() => {
    const indices = Object.keys(dates)
    let ticks = indices
    if (chartZoom) {
      const [minIndex, maxIndex] = xAxisDomain
      ticks = indices.slice(minIndex, maxIndex + 1)
    }
    return {
      allowDataOverflow: true,
      dataKey: 'index',
      domain: xAxisDomain,
      ticks,
      type: 'number'
    }
  }, [xAxisDomain, dates])

  const [zoomArea, setZoomArea] = React.useState({})
  const [isHovering, setIsHovering] = React.useState(false)

  const eventHandlers = useMemo(() => {
    const clickHandlers = {
      onClick: item => {
        if (item && !zoomArea.dragged) {
          setDate(data[item.activeLabel].date)
        }
        if (zoomEnabled) {
          setZoomArea({ dragged: zoomArea.dragged })
        }
      },
      onMouseDown: e => {
        if (e && zoomEnabled) {
          setZoomArea({ start: e.activeLabel, end: e.activeLabel, dragged: false })
        }
      },
      onMouseMove: e => {
        if (e) {
          setIsHovering(e.activeLabel !== undefined)
          if (zoomArea.start === undefined) return
          let end = e.activeLabel
          if (e.activeLabel === undefined) { // outside of axes
            end = xAxisDomain[zoomArea.end >= data.length / 2 ? 1 : 0]
          }
          setZoomArea({ start: zoomArea.start, end, dragged: true })
        }
      },
      onMouseLeave: e => {
        setIsHovering(false)
      },
      onMouseUp: (_, e) => {
        if (zoomArea.end !== zoomArea.start) {
          const xMin = data[zoomArea.start].date
          const xMax = data[zoomArea.end].date
          setChartZoom(xMin, xMax)
        }
        setZoomArea({ dragged: zoomArea.dragged })
      }
    }
    if (!tooltipEnabled) { // touch handlers need to be replaced when tooltip is missing
      return {
        ...clickHandlers,
        onTouchStart: clickHandlers.onMouseDown,
        onTouchMove: clickHandlers.onMouseMove,
        onTouchEnd: clickHandlers.onMouseUp
      }
    }
    return clickHandlers
  }, [zoomEnabled, data, zoomArea, isHovering])

  const cursor = useMemo(() => {
    if (zoomArea.start) return 'ew-resize'
    if (isHovering) return 'crosshair'
    return undefined
  }, [zoomArea, isHovering])

  return (
    <div
      className={classNames('relative select-none focus:outline-none', className)}
      onDoubleClick={clearChartZoom}
    >
      <MainChart
        {...{
          ...chartProps,
          ...eventHandlers,
          activeLineages,
          chart,
          chartZoom,
          cursor,
          darkMode,
          precision,
          preset,
          stroke,
          tooltipEnabled,
          type,
          xAxisProps,
          yAxisConfig,
          zoomArea
        }}
      />
      <div className='absolute top-0 left-0 pointer-events-none'>
        <ComposedChart {...chartProps} data={data}>
          <XAxis
            {...xAxisProps}
            tick={false}
            stroke='none'
          />
          <YAxis
            width={48}
            tick={false}
            stroke='none'
          />
          <ReferenceLine
            x={dates.indexOf(date)}
            stroke={tailwindColors[stroke][darkMode ? 300 : 400]}
            label=''
            strokeWidth={2}
            style={{ mixBlendMode: darkMode ? 'screen' : 'multiply' }}
          />
        </ComposedChart>
      </div>
    </div>
  )
}

export default MultiLinePlot
