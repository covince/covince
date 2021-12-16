import React, { useState, useCallback, useMemo, useEffect } from 'react'
import Measure from 'react-measure'

import MultiLinePlot from './MultiLinePlot'
import { Heading } from './Typography'
import classNames from 'classnames'
import Checkbox from './Checkbox'

import useQueryAsState from '../hooks/useQueryAsState'

const sortByDate = (a, b) =>
  a.date > b.date ? 1 : a.date < b.date ? -1 : 0

const convertToTSV = (data) =>
  ['date,lineage,value,lower,upper']
    .concat(
      ...data
        .sort(sortByDate)
        .map(d => [d.date, d.lineage, d.mean, d.range[0], d.range[1]].join(','))
    )
    .join('\n')

const ChartHeading = ({ isMobile, ...props }) =>
  isMobile
    ? <h2 {...props} className={classNames(props.className, 'font-bold text-heading whitespace-nowrap')} />
    : <Heading {...props} />

const Chart = ({ heading, defaultType, parameter, isMobile, allowStack, numCharts, ...props }) => {
  const line_type_accessor = `${parameter}_type`
  const [query, updateQuery] = useQueryAsState({ [line_type_accessor]: defaultType })

  const handleGraphTypeChange = useCallback(function (event) {
    updateQuery({ [line_type_accessor]: event.target.checked ? 'area' : 'line' })
  }, [updateQuery])

  const [height, setHeight] = useState(0)

  const { area_data, activeLineages, chartZoom } = props
  const downloadURL = useMemo(() => {
    const [minDate, maxDate] = chartZoom.dateRange || []
    const filteredData = area_data
      .filter(d => (
        d.parameter === parameter &&
        activeLineages[d.lineage].active &&
        (minDate ? d.date >= minDate : true) &&
        (maxDate ? d.date <= maxDate : true)
      ))

    const tsv = convertToTSV(filteredData)
    const blob = new Blob([tsv], { type: 'text/csv' })
    return window.URL.createObjectURL(blob)
  }, [area_data, activeLineages, chartZoom])

  useEffect(() => {
    return () => window.URL.revokeObjectURL(downloadURL)
  }, [downloadURL])

  const chart = (
    <>
      <header className='ml-12 mr-6 flex items-baseline'>
        <ChartHeading isMobile={isMobile}>{heading}</ChartHeading>
        <a
          className='ml-3 text-xs tracking-wider font-normal text-subheading underline hover:no-underline'
          href={downloadURL}
          download={`${heading}.csv`}
        >
          to CSV
        </a>
        { allowStack &&
          <Checkbox
            id={line_type_accessor}
            className='text-primary ml-auto self-center md:self-end'
            checked={query[line_type_accessor] === 'area'}
            label='Stack'
            onChange={handleGraphTypeChange}
            toggle
          /> }
      </header>
      <MultiLinePlot
        height={isMobile ? props.width * (1 / 2) : Math.max(height - 24, props.width * (1 / numCharts), 168)}
        {...props}
        className='-mt-1 md:m-0'
        type={query[line_type_accessor]}
        parameter={parameter}
      />
    </>
  )

  if (isMobile) {
    return <div className='max-w-max'>{chart}</div>
  }

  return (
    <Measure
      bounds
      onResize={rect => {
        // setting width here does not work when reducing screen size
        setHeight(rect.bounds.height)
      }}
    >
      {({ measureRef }) => (
        <div ref={measureRef}>
          {chart}
        </div>
      )}
    </Measure>
  )
}

export default Chart
