import React, { useMemo, useCallback } from 'react'
import { HiOutlineCog } from 'react-icons/hi'
import classNames from 'classnames'

import Button from '../components/Button'
import Select from '../components/Select'
import { Heading } from '../components/Typography'
import Spinner from '../components/Spinner'
import FadeTransition from '../components/FadeTransition'

import LineageTree from '../components/LineageTree'
import LineageDateFilter from '../components/LineageDateFilter'
import SearchMutations from '../components/SearchMutations'

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

export default (props) => {
  const {
    api_url,
    darkMode,
    info,
    isMobile,
    lineages,
    lineageToColourIndex,
    lineageTree,
    lineageView,
    nextColourIndex,
    queryParams,
    setLineageView,
    showMutationSearch,
    submit
  } = props

  const MapView = useCallback((MapView) => {
    if (isMobile) {
      return MapView
    }
    const DecoratedMapView = (props) => {
      const {
        children,
        darkMode,
        heading,
        lineageToColourIndex,
        lineageTree,
        lineageView,
        nextColourIndex,
        queryParams,
        setLineageView,
        showMutationSearch,
        submit
      } = props
      return (
        <MapView heading={lineageView ? null : heading}>
          { lineageView
            ? lineageView === '1'
              ? <InstantLineageTree
                  darkMode={darkMode}
                  maxLineages={info.maxLineages}
                  onClose={() => setLineageView(false)}
                  lineageToColourIndex={lineageToColourIndex}
                  nextColourIndex={nextColourIndex}
                  showMutationSearch={showMutationSearch}
                  submit={submit}
                  {...lineageTree}
                />
              : <SearchMutations
                  api_url={api_url}
                  genes={info.genes}
                  lineage={lineageView}
                  lineageToColourIndex={lineageToColourIndex}
                  nextColourIndex={nextColourIndex}
                  queryParams={queryParams}
                  showMutationSearch={showMutationSearch}
                  submit={submit}
                />
            : children }
        </MapView>
      )
    }
    return DecoratedMapView
  }, [isMobile])

  const mapViewProps = useMemo(() => ({
    darkMode,
    lineageToColourIndex,
    lineageTree,
    lineageView,
    nextColourIndex,
    queryParams,
    setLineageView,
    showMutationSearch,
    submit
  }), [lineageView, darkMode, ...(isMobile ? [] : [lineageTree, lineageToColourIndex, queryParams])])

  const LineageFilter = useCallback((LineageFilter) => {
    const DecoratedLineageFilter =
      ({ lineageView, setLineageView, lineages, ...props }) => {
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
                  onClick={() => setLineageView(!lineageView)}
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
    lineageView,
    setLineageView,
    lineages
  }), [lineageView, lineages])

  const DateFilter = useCallback((DateFilter) => {
    if (isMobile || !lineageView) return DateFilter
    const DecoratedDateFilter = ({ allDates }) => {
      return <LineageDateFilter dates={allDates} />
    }
    return DecoratedDateFilter
  }, [isMobile, lineageView])

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
