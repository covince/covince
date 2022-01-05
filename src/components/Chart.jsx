import React, { useState, useCallback, useMemo, useEffect } from 'react'
import Measure from 'react-measure'
import { BsFileEarmarkText as DownloadIcon } from 'react-icons/bs'

import MultiLinePlot from './MultiLinePlot'
import { Heading } from './Typography'
import classNames from 'classnames'
import Checkbox from './Checkbox'

import useQueryAsState from '../hooks/useQueryAsState'
import { useConfig } from '../config'

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
    ? <h2 {...props} className={classNames(props.className, 'font-bold text-heading')} />
    : <Heading {...props} />

const Chart = (props) => {
  const {
    allowStack,
    areaName,
    defaultType,
    heading,
    isMobile,
    numCharts,
    parameter,
    ...plot
  } = props

  const line_type_accessor = `${parameter}_type`
  const [query, updateQuery] = useQueryAsState({ [line_type_accessor]: defaultType })

  const handleGraphTypeChange = useCallback(function (event) {
    updateQuery({ [line_type_accessor]: event.target.checked ? 'area' : 'line' })
  }, [updateQuery])

  const [height, setHeight] = useState(0)

  const { area_data, activeLineages, chartZoom } = props

  const config = useConfig()
  const { csv_download } = config.chart.settings

  const [downloadURL, fileName] = useMemo(() => {
    if (!csv_download) return []

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
    return [
      window.URL.createObjectURL(blob),
      `${heading} in ${areaName}`.split(/[\s\W]+/).join('_') + '.csv'
    ]
  }, [area_data, activeLineages, chartZoom])

  const parameterConfig = useMemo(() => config.parameters.find(_ => _.id === parameter), [parameter])

  useEffect(() => {
    return () => window.URL.revokeObjectURL(downloadURL)
  }, [downloadURL])

  const chart = (
    <>
      <header className='ml-12 mr-6 -mb-0.5 flex items-center md:items-end'>
        <ChartHeading isMobile={isMobile} className='whitespace-nowrap mr-auto'>{heading}</ChartHeading>
        <span className='divide-x-2 divide-dotted divide-gray-300 dark:divide-gray-400 inline-flex items-center'>
          { !!csv_download &&
            <a
              className='mr-1.5 text-xs tracking-wider font-normal text-subheading md:opacity-70 hover:opacity-100 whitespace-nowrap'
              href={downloadURL}
              download={fileName}
              title='Download as CSV'
            >
              <span className='sr-only'>{heading} as CSV</span>
              <DownloadIcon className='h-5 w-5' />
            </a> }
          { allowStack &&
            <Checkbox
              id={line_type_accessor}
              className='pl-2 py-0.5 text-primary self-center md:self-end'
              checked={query[line_type_accessor] === 'area'}
              label='Stack'
              onChange={handleGraphTypeChange}
              toggle
            /> }
        </span>
      </header>
      <MultiLinePlot
        height={isMobile ? props.width * (1 / 2) : Math.max(height - 24, props.width * (1 / numCharts), 168)}
        {...plot}
        className='-mt-1 md:m-0'
        type={query[line_type_accessor]}
        parameter={parameterConfig}
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
        <div className='max-w-max' ref={measureRef}>
          {chart}
        </div>
      )}
    </Measure>
  )
}

export default Chart
