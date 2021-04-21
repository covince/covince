import React, { useState, useMemo, useCallback } from 'react'
import classNames from 'classnames'
import format from 'date-fns/format'
import { BsArrowRightShort } from 'react-icons/bs'

import Chloropleth from './Chloropleth'
import LocalIncidence from './LocalIncidence'
import Card from './Card'
import Select from './Select'
import { Heading } from './Typography'
import { PillButton } from './Button'
import Spinner from './Spinner'
import FadeTransition from './FadeTransition'
import DateFilter from './DateFilter'
import LocationFilter from './LocationFilter'
import FilterSection from './FilterSection'
import StickyActionButton from './StickyActionButton'

import useMobile from '../hooks/useMobile'
import useAreas from '../hooks/useAreas'
import useLineages from '../hooks/useLineages'
import useAreaLookupTable from '../hooks/useAreaLookupTable'
import useDates from '../hooks/useDates'

const Covid19 = ({ lineColor = 'blueGray', tiles, data, dataPath }) => {
  const AreaLookupTable = useAreaLookupTable(tiles, data.overview)

  const unique_lineages = data.lineages

  const [areaState, areaActions] = useAreas(dataPath)
  const [lineageState, lineageActions, results] = useLineages(dataPath)
  const [
    { date, playing },
    { setDate, setPlaying, persistDate }
  ] = useDates(results ? results.dates : [], data.initialDate)

  let unique_parameters = ['lambda', 'p', 'R']

  const handleOnClick = (area) => {
    areaActions.load(area)
  }

  unique_parameters = [['lambda', 'Incidence'], ['p', 'Proportion'], ['R', 'R']]
  if (lineageState.lineage === 'total') {
    unique_parameters = unique_parameters[0]
  }
  const parameter_options = unique_parameters.map((x) => <option key={x[0]} value={x[0]}>{x[1]}</option>)

  const [view, setView] = useState('chart')
  const handleSetView = useCallback(view => {
    window.scrollTo({ top: 0 })
    setView(view)
  }, [setView])
  const isMobile = useMobile()

  const locationFilter = useMemo(() => {
    if (areaState.currentArea === 'overview') {
      return {
        category: data.overview.category,
        heading: data.overview.heading,
        subheading: (
          <span className='flex items-center text-subheading'>
            Explore {data.overview.subnoun_plural} {
            isMobile
              ? <button onClick={() => handleSetView('map')} className='px-1 underline text-primary font-medium'>on the map</button>
              : 'on the map'
            }
          </span>
        )
      }
    }
    return {
      category: data.overview.subnoun_singular,
      heading: AreaLookupTable[areaState.currentArea],
      subheading: areaState.currentArea,
      showOverviewButton: areaState.loadingArea !== 'overview',
      loadOverview: () => areaActions.load('overview')
    }
  }, [areaState, isMobile])

  const formattedDate = useMemo(() => format(new Date(date), 'd MMMM y'), [date])

  const dateFilter = {
    dates: results ? results.dates : null,
    label: formattedDate,
    value: date,
    onChange: (e) => {
      const { value } = e.target
      const set_to = results.dates[value]
      setDate(set_to)
    },
    playing: playing,
    setPlaying: setPlaying,
    persistDate: (e) => {
      const { value } = e.target
      const set_to = results.dates[value]
      persistDate(set_to)
    }
  }

  const isInitialLoad = useMemo(() => (
    lineageState.lineage === null || areaState.currentArea === null
  ), [lineageState.lineage, areaState.currentArea])

  return (
    <>
      { isMobile && view === 'chart' &&
        <LocationFilter overviewButtonText={AreaLookupTable.overview}
          className='px-4 pt-3 pb-0 bg-white relative z-10 h-22'
          {...locationFilter}
          loading={isInitialLoad}
        /> }
      { !isMobile &&
        <FilterSection className='overflow-hidden'>
          <DateFilter className='w-80' {...dateFilter} />
          <div className='border border-gray-200 mx-6 hidden md:block' />
          <LocationFilter overviewButtonText={AreaLookupTable.overview} className='w-80 relative' {...locationFilter} loading={areaState.status === 'LOADING'} />
          <FadeTransition in={isInitialLoad}>
            <div className='bg-white absolute inset-0 grid place-content-center'>
              <Spinner className='text-gray-500 w-6 h-6' />
            </div>
          </FadeTransition>
        </FilterSection> }
      <Card className={classNames('relative flex-grow flex flex-col md:grid md:grid-cols-2 md:grid-rows-1-full md:gap-6 pt-3 md:px-6 md:py-6', { 'pb-0': isMobile && view === 'map' })}>
        <div className={classNames('flex flex-col flex-grow', { hidden: isMobile && view === 'chart' })}>
          <div className='flex justify-between items-center space-x-3 overflow-hidden'>
            <Heading>Map</Heading>
            {isMobile &&
              <div className='flex items-center max-w-none min-w-0'>
                <FadeTransition in={areaState.status === 'LOADING'}>
                  <Spinner className='h-4 w-4 mr-2 text-gray-500' />
                </FadeTransition>
                <PillButton
                  className='flex items-center space-x-1 min-w-0 h-8 pr-2'
                  onClick={() => handleSetView('chart')}
                >
                  <span className='truncate'>{locationFilter.heading}</span>
                  <BsArrowRightShort className='w-6 h-6 flex-shrink-0' />
                </PillButton>
              </div> }
          </div>
          <form className={classNames(
            'grid grid-cols-3 gap-3 max-w-md lg:flex lg:gap-0 lg:space-x-3 lg:max-w-none text-sm pb-3 mt-2 md:mt-3 transition-opacity',
            { 'opacity-50 pointer-events-none': lineageState.status === 'LOADING' && !isInitialLoad }
          )}>
            <div>
              <label className='block font-medium mb-1'>
                Lineage
              </label>
              <Select
                value={lineageState.loading.lineage || lineageState.lineage}
                name='lineages'
                onChange={e => lineageActions.setLineage(e.target.value)}
              >
                {unique_lineages.map((x) => <option key={x}>{x}</option>)}
              </Select>
            </div>
            <div>
              <label className='block font-medium mb-1'>
                Color by
              </label>
              <Select
                value={lineageState.loading.colorBy || lineageState.colorBy}
                name='parameters'
                onChange={e => lineageActions.colorBy(e.target.value)}
              >
                {parameter_options}
              </Select>
            </div> {lineageState.colorBy !== 'R' &&
              <div>
                <label className='block font-medium mb-1'>
                  Scale
              </label>

                <Select
                  value={lineageState.scale || ''}
                  name='color_scale_type'
                  onChange={e => lineageActions.setScale(e.target.value)}
                >
                  <option value='linear'>Linear</option>
                  <option value='quadratic'>Quadratic</option>
                </Select>
              </div>}
          </form>
          <div className='relative flex-grow -mx-3 md:m-0 flex flex-col md:rounded-md overflow-hidden'>
            <Chloropleth
              className='flex-grow'
              selected_area={areaState.loadingArea || areaState.currentArea}
              tiles={tiles}
              color_scale_type={lineageState.colorBy === 'R' ? 'R_scale' : lineageState.scale}
              max_val={results ? results.max : 0}
              min_val={results ? results.min : 0}
              index={results ? results.index : null}
              date={date}
              handleOnClick={handleOnClick}
              isMobile={isMobile}
              percentage={lineageState.colorBy === 'p'}
              lineColor={lineColor}
            />
            <FadeTransition in={lineageState.status === 'LOADING' && !isInitialLoad}>
              <div className='bg-white bg-opacity-75 absolute inset-0 grid place-content-center'>
                <Spinner className='text-gray-500 w-6 h-6' />
              </div>
            </FadeTransition>
            <div className='absolute inset-0 shadow-inner pointer-events-none' style={{ borderRadius: 'inherit' }} />
          </div>
        </div>
        <LocalIncidence
        chartDefinitions = {data.chartDefinitions}
          colors={data.colors}
          className={classNames(
            'transition-opacity flex-grow', {
              hidden: view === 'map',
              'opacity-50 pointer-events-none': areaState.status === 'LOADING' && !isInitialLoad
            }
          )}
          name={AreaLookupTable[areaState.currentArea]}
          date={date}
          setDate={persistDate}
          selected_area={areaState.currentArea}
          values={areaState.data}
          isMobile={isMobile}
          lineColor={lineColor}
        />
        { isMobile && view === 'chart' &&
          <StickyActionButton
            onClick={() => handleSetView('map')}
          >
            View map on {formattedDate}
          </StickyActionButton> }
        <FadeTransition in={isInitialLoad}>
          <div className='bg-white bg-opacity-50 absolute inset-0 md:rounded-md' />
        </FadeTransition>
      </Card>
      { isMobile && view === 'map' &&
        <DateFilter
          className='p-3 bg-white shadow border-t border-gray-100 relative z-10'
          {...dateFilter}
        /> }
    </>
  )
}

export default Covid19
