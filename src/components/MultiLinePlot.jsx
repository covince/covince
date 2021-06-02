import './MultiLinePlot.css'

import React, { useMemo } from 'react'
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ComposedChart, Area, ReferenceArea } from 'recharts'
import format from 'date-fns/format'
import * as tailwindColors from 'tailwindcss/colors'
import classNames from 'classnames'
import { orderBy } from 'lodash'

import useChartZoom from '../hooks/useChartZoom'
import config from '../config'

const formatLargeNumber = number => {
  const fixed = number.toFixed(2)
  return parseFloat(fixed).toLocaleString(undefined, { minimumFractionDigits: 2 })
}

const CustomTooltip = ({ active, payload, label, percentage, dates }) => {
  if (active && payload) {
    const _payload = payload.filter(_ => _.value > 0)
    _payload.sort((a, b) => {
      if (a.value < b.value) return 1
      if (a.value > b.value) return -1
      return 0
    })
    const { timeline } = config
    return (
      <div className='p-3 bg-white shadow-md rounded-md text-sm leading-5 ring-1 ring-black ring-opacity-5'>
        <h4 className='text-center text-gray-700 font-bold mb-1'>
          {format(new Date(dates[label]), timeline.date_format.chart_tooltip)}
        </h4>
        <table className='tabular-nums w-full'>
          <thead className='sr-only'>
            <tr>
              <th>Color</th>
              <th>Lineage</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
          {_payload.length === 0 && <tr><td colSpan={3} className='text-center text-gray-700'>No data</td></tr>}
          {_payload.map(item => {
            if (item.name === '_range') {
              return null
            }
            return (
              <tr key={item.name} className='tooltip_entry'>
                <td>
                  <i className='block rounded-full h-3 w-3' style={{ backgroundColor: item.stroke }} />
                </td>
                <td className='px-3'>
                  {item.name}
                </td>
                <td className='text-right'>
                  {percentage ? `${item.value.toFixed(1)}%` : formatLargeNumber(item.value)}
                </td>
              </tr>
            )
          })}
          </tbody>
        </table>
      </div>
    )
  }

  return null
}

const animationDuration = 500

const MainChart = React.memo((props) => {
  const {
    activeLineages, chart, chartZoomApplied,
    stroke, preset, type,
    xAxisProps, yAxisConfig = {},
    zoomArea, ...chartProps
  } = props

  const { lineages, data, dates } = chart

  const yAxisDomain = useMemo(() => {
    if (chartZoomApplied && type !== 'area' && data.length) {
      const range = data.slice(...xAxisProps.domain)
      let { minY: min, maxY: max } = range[0]
      for (const { minY, maxY } of range.slice(1)) {
        min = Math.min(minY, min)
        max = Math.max(maxY, max)
      }
      console.log([min, max])
      return [min, max]
    }
    if (preset === 'percentage' && type === 'area' && lineages.length) {
      return [0, 1]
    } else if (yAxisConfig && yAxisConfig.domain) {
      return yAxisConfig.domain
    } else {
      return [0, 'auto']
    }
  }, [preset, type, yAxisConfig, lineages, chartZoomApplied, data])

  const yAxisTicks = useMemo(() => {
    if (preset === 'percentage') {
      if (lineages.length === 0) {
        return { ticks: false }
      }
      const fullScale = lineages.length === Object.keys(activeLineages).length
      if (fullScale) {
        return {
          tickFormatter: value => `${Math.min(parseFloat(value), 100)}%`,
          ticks: [0, 25, 50, 75, 100]
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
      ticks: chartZoomApplied ? undefined : yAxisConfig.ticks
    }
  }, [preset, lineages, activeLineages, yAxisConfig, chartZoomApplied])

  const grid =
    <CartesianGrid stroke={tailwindColors[stroke][300]} />

  const tooltip = useMemo(() =>
    <Tooltip
      content={CustomTooltip}
      percentage={preset === 'percentage'}
      dates={dates}
      cursor={{ stroke: tailwindColors[stroke][400] }}
    />
  , [format, stroke, dates])

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
      allowDataOverflow={yAxisConfig.allow_data_overflow || false}
      domain={yAxisDomain}
      fontSize='12'
      width={48}
      stroke='currentcolor'
      tickMargin='4'
      tick={data.length}
      allowDecimals={false}
      {...yAxisTicks}
    />

  const areas = useMemo(() => {
    if (type === 'area') {
      return lineages.map(({ lineage, colour }) => (
        <Area
          key={lineage}
          activeDot={{ stroke: tailwindColors[stroke][400] }}
          dataKey={lineage}
          dot={false}
          fill={colour}
          name={lineage}
          stackId='1'
          stroke={colour}
          type='monotone'
          animationDuration={animationDuration}
          isAnimationActive={true}
        />
      ))
    }
    return lineages.map(({ lineage, colour }) => {
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
  }, [lineages, stroke, type])

  const lines = useMemo(() => {
    if (type === 'area') return null
    return lineages.map(({ lineage, colour }) =>
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
        stroke={tailwindColors[stroke][600]}
        strokeDasharray={[8, 8]}
        label=''
        strokeWidth={2}
        style={{ mixBlendMode: 'multiply' }}
      />
    )
  }, [yAxisConfig.reference_line, stroke])

  const cursor = useMemo(() => {
    if (zoomArea.start) return 'ew-resize'
    return 'crosshair'
  }, [zoomArea])

  return (
    <ComposedChart
      {...chartProps}
      data={[...data] /* new array required for animations */}
      cursor={cursor}
    >
      {grid}
      {areas}
      {xAxis}
      {yAxis}
      {tooltip}
      {yReference}
      {lines}
      {zoomArea.start
        ? <ReferenceArea x1={zoomArea.start} x2={zoomArea.end} strokeOpacity={0.3} />
        : null}
    </ComposedChart>
  )
})
MainChart.displayName = 'MainChart'

const MultiLinePlot = props => {
  const {
    parameter, preset = parameter === 'p' ? 'percentage' : null, // back compat
    yAxis: yAxisConfig, /* xAxis: xAxisConfig = {}, */
    date, setDate, area_data, activeLineages,
    type, width, height = 120, stroke = 'blueGray', className
  } = props

  const { xMin, xMax, setChartZoom, clearChartZoom, chartZoomApplied } = useChartZoom()

  const chart = useMemo(() => {
    const dataByDate = {}
    const presentLineages = new Set()

    for (const d of area_data) {
      if (d.parameter === parameter && d.lineage !== 'total') {
        const maxY = d.date in dataByDate ? dataByDate[d.date].maxY : 0
        const minY = d.date in dataByDate ? dataByDate[d.date].minY : Number.MAX_VALUE
        dataByDate[d.date] = {
          ...dataByDate[d.date],
          date: d.date,
          [d.lineage]: d.mean,
          [`${d.lineage}_range`]: d.range,
          maxY: Math.max(maxY, d.range[1]),
          minY: Math.min(minY, d.range[0])
        }
        presentLineages.add(d.lineage)
      }
    }

    const lineages = []
    for (const lineage of Array.from(presentLineages)) {
      const { active, colour } = activeLineages[lineage]
      if (active) {
        lineages.push({ lineage, colour })
      }
    }

    const data =
      orderBy(Object.values(dataByDate), 'date', 'asc')
        .map((d, index) => ({ ...d, index }))

    const dates = data.map(_ => _.date)

    return {
      lineages,
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
    const min = 0
    const max = data.length - 1
    if (xMin && xMax && dates.length) {
      const _xMin = Math.max(dates.indexOf(xMin), min)
      let _xMax = dates.indexOf(xMax)
      if (_xMax === -1) _xMax = max
      return _xMin < _xMax ? [_xMin, _xMax] : [_xMax, _xMin]
    }
    return [min, max]
  }, [xMax, dates])

  const xAxisProps = useMemo(() => {
    const indices = Object.keys(dates)
    const ticks = xMin && xMax ? indices.slice(...xAxisDomain) : indices
    return {
      allowDataOverflow: true,
      dataKey: 'index',
      domain: xAxisDomain,
      ticks,
      type: 'number'
    }
  }, [xAxisDomain, dates])

  const [zoomArea, setZoomArea] = React.useState({})

  const eventHandlers = useMemo(() => {
    return {
      onClick: item => {
        if (item && !zoomArea.dragged) {
          setDate(data[item.activeLabel].date)
        }
        setZoomArea({ dragged: zoomArea.dragged })
      },
      onMouseDown: e => {
        setZoomArea({ start: e.activeLabel, end: e.activeLabel, dragged: false })
      },
      onMouseMove: e => {
        if (!zoomArea.start) return
        let end = e.activeLabel
        if (e.activeLabel === undefined) { // outside of axes
          end = xAxisDomain[zoomArea.end >= data.length / 2 ? 1 : 0]
        }
        setZoomArea({ start: zoomArea.start, end, dragged: true })
      },
      onMouseUp: () => {
        if (zoomArea.end !== zoomArea.start) {
          const xMin = data[zoomArea.start].date
          const xMax = data[zoomArea.end].date
          setChartZoom(xMin, xMax)
        }
        setZoomArea({ dragged: zoomArea.dragged })
      }
    }
  }, [zoomArea])

  return (
    <div
      className={classNames('relative select-none', className)}
      onDoubleClick={clearChartZoom}
    >
      <MainChart
        {...{
          ...chartProps,
          ...eventHandlers,
          activeLineages,
          chart,
          chartZoomApplied,
          preset,
          stroke,
          type,
          xAxisProps,
          yAxisConfig,
          zoomArea
        }}
      />
      <div className='absolute top-0 left-0 pointer-events-none'>
        <ComposedChart {...chartProps} data={data} className='test'>
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
            stroke={tailwindColors[stroke][400]}
            label=''
            strokeWidth={2}
            style={{ mixBlendMode: 'multiply' }}
          />
        </ComposedChart>
      </div>
    </div>
  )
}

export default MultiLinePlot
