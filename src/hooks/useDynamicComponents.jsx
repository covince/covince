import React, { useMemo, useCallback } from 'react'
import { HiOutlineCog } from 'react-icons/hi'
import { format } from 'date-fns'
import classNames from 'classnames'

import Button from '../components/Button'
import Select from '../components/Select'
import { DescriptiveHeading, Heading } from '../components/Typography'
import Spinner from '../components/Spinner'
import FadeTransition from '../components/FadeTransition'

import LineageTree from '../components/LineageTree'

import useQueryAsState from './useQueryAsState'

export const LineageLimit = ({ className, numberSelected, maxLineages }) => (
  <p className={classNames(className, 'whitespace-nowrap', { 'font-bold text-red-700 dark:text-red-300': numberSelected === maxLineages })}>
    {numberSelected} / {maxLineages}
    <span className='hidden lg:inline'>&nbsp;selected</span>
  </p>
)

export const lineagePresets = [
  { value: 'all', label: 'All lineages' },
  { value: 'selected', label: 'Selected lineages' },
  { value: 'who', label: 'WHO variants' }
]

const InstantLineageTree = ({ onClose, lineageToColourIndex, submit, ...props }) => {
  const { numberSelected, maxLineages, preset, setPreset } = props
  return (
    <>
      <header className='flex items-baseline'>
        <Heading>Lineages</Heading>
        <button className='text-subheading dark:text-dark-subheading h-6 px-1 mx-1.5 flex items-center text-sm border border-transparent focus:primary-ring rounded' onClick={onClose}>
          Back to Map
        </button>
        <div className='text-right flex items-baseline space-x-3 ml-auto text-sm'>
          <LineageLimit numberSelected={numberSelected} maxLineages={maxLineages} />
          <Button className='flex items-center h-6 px-2' onClick={() => submit({})}>
            Clear <span className='hidden md:inline'>&nbsp;selection</span>
          </Button>
        </div>
      </header>
      <LineageTree
        className='mt-3 flex-grow'
        lineageToColourIndex={lineageToColourIndex}
        submit={submit}
        {...props}
        action={
          <Select value={preset} onChange={e => setPreset(e.target.value)}>
            {lineagePresets.map(({ value, label }) =>
              <option key={value} value={value}>{label}</option>
            )}
          </Select>
        }
      />
    </>
  )
}

const LineageDateFilter = ({ dates = [] }) => {
  const defaultValues = dates.length
    ? {
        xMin: dates[0],
        xMax: dates[dates.length - 1]
      }
    : {}
  const [{ xMin, xMax }, updateQuery] = useQueryAsState(defaultValues)

  const options = useMemo(() => {
    return dates.map(d => ({ value: d, label: format(new Date(d), 'dd MMM y') }))
  }, [dates])

  const [fromOptions, toOptions] = useMemo(() => {
    const fromItem = options.find(_ => _.value === xMin)
    const toItem = options.find(_ => _.value === xMax)
    return [
      toItem ? options.slice(0, options.indexOf(toItem) + 1) : options,
      fromItem ? options.slice(options.indexOf(fromItem)) : options
    ]
  }, [xMin, xMax])

  return (
    <div className='h-20'>
      <header className='flex justify-between items-center'>
        <DescriptiveHeading>Time Period</DescriptiveHeading>
        <Button
          disabled={xMin === defaultValues.xMin && xMax === defaultValues.xMax}
          className='flex items-center h-6 px-2 disabled:text-gray-500 dark:disabled:text-gray-400'
          onClick={() => updateQuery({ xMin: undefined, xMax: undefined })}
        >
          Reset dates
        </Button>
      </header>
      <form className='mt-3 flex items-baseline text-sm space-x-3'>
        <div className='w-1/2'>
          <label className='block font-medium mb-1 sr-only'>
            From Date
          </label>
          <Select
            className={classNames(xMin === defaultValues.xMin ? 'text-gray-600 dark:text-gray-300' : 'font-medium')}
            value={xMin}
            name='lineages from date'
            onChange={e => updateQuery({ xMin: e.target.value })}
          >
            {fromOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </Select>
        </div>
        <p>to</p>
        <div className='w-1/2'>
          <label className='block font-medium mb-1 sr-only'>
            To Date
          </label>
          <Select
            className={classNames(xMax === defaultValues.xMax ? 'text-gray-600 dark:text-gray-300' : 'font-medium')}
            value={xMax}
            name='lineages to date'
            onChange={e => updateQuery({ xMax: e.target.value })}
          >
            {toOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </Select>
        </div>
      </form>
    </div>
  )
}

export default (props) => {
  const {
    darkMode,
    info,
    isMobile,
    lineages,
    lineageToColourIndex,
    lineageTree,
    setLineageView,
    showLineageView,
    submit
  } = props

  const MapView = useCallback((MapView) => {
    if (isMobile) return MapView
    const DecoratedMapView = (props) => {
      const {
        children,
        darkMode,
        heading,
        lineageTree,
        lineageToColourIndex,
        setLineageView,
        showLineageView,
        submit
      } = props
      return (
        <MapView heading={showLineageView ? null : heading}>
          { showLineageView
            ? <InstantLineageTree
                darkMode={darkMode}
                maxLineages={info.maxLineages}
                onClose={() => setLineageView(false)}
                lineageToColourIndex={lineageToColourIndex}
                submit={submit}
                {...lineageTree}
              />
            : children }
        </MapView>
      )
    }
    return DecoratedMapView
  }, [isMobile])

  const mapViewProps = useMemo(() => ({
    showLineageView,
    setLineageView,
    darkMode,
    lineageTree,
    lineageToColourIndex,
    submit
  }), [showLineageView, darkMode, ...(isMobile ? [] : [lineageTree, lineageToColourIndex])])

  const LineageFilter = useCallback((LineageFilter) => {
    const DecoratedLineageFilter =
      ({ showLineageView, setLineageView, lineages, ...props }) => {
        const { activeLineages } = props
        const isLoading = useMemo(() => Object.keys(activeLineages).length !== lineages.length, [activeLineages, lineages])
        return (
          <LineageFilter
            {...props}
            fixedLayout
            heading={
              <div className='relative z-10 -top-0.5 -left-1.5 md:-left-1 space-x-1.5 pr-8'>
                <Button
                  className='h-8 md:h-6 pl-2 pr-1 flex items-center hover:bg-gray-50 !text-primary'
                  onClick={() => setLineageView(!showLineageView)}
                >
                  Lineages
                  <HiOutlineCog className='ml-1 h-5 w-5 stroke-current' />
                </Button>
                { !props.isMobile &&
                  <div className='absolute top-0 bottom-0 right-0 flex items-center'>
                    <FadeTransition in={isLoading}>
                      <Spinner className='h-3.5 w-3.5 text-gray-500 dark:text-gray-200' />
                    </FadeTransition>
                  </div> }
              </div>
            }
            emptyMessage={
              <p className='text-sm text-gray-500 dark:text-gray-300 mb-3'>
                No lineages selected
              </p>
            }
          />
        )
      }

    return DecoratedLineageFilter
  }, [])

  const lineageFilterProps = useMemo(() => ({
    showLineageView,
    setLineageView,
    lineages
  }), [showLineageView, lineages])

  const DateFilter = useCallback((DateFilter) => {
    if (isMobile || !showLineageView) return DateFilter
    const DecoratedDateFilter = ({ allDates }) => {
      return <LineageDateFilter dates={allDates} />
    }
    return DecoratedDateFilter
  }, [isMobile, showLineageView])

  const dateFilterProps = useMemo(() => ({
    allDates: info.dates
  }), [])

  const decorators = useMemo(() => ({
    DateFilter,
    LineageFilter,
    MapView
  }), [MapView, DateFilter])

  const componentProps = useMemo(() => ({
    MapView: mapViewProps,
    LineageFilter: lineageFilterProps,
    DateFilter: dateFilterProps
  }), [mapViewProps, lineageFilterProps, dateFilterProps])

  return useMemo(() => ({ decorators, props: componentProps }), [decorators, componentProps])
}
