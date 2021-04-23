import React, { useMemo } from 'react'
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
import StickyMobileSection from './StickyMobileSection'
import LineageFilter from './LineageFilter'

import { useMobile } from '../hooks/useMediaQuery'
import useAreas from '../hooks/useAreas'
import useLineages from '../hooks/useLineages'
import useAreaLookupTable from '../hooks/useAreaLookupTable'
import useDates from '../hooks/useDates'
import useMobileView from '../hooks/useMobileView'
import useLineageFilter from '../hooks/useLineageFilter'

const UI = ({ lineColor = 'blueGray', tiles, data, dataPath }) => {
  const AreaLookupTable = useAreaLookupTable(tiles, data.overview)

  const unique_lineages = data.lineages

  const [areaState, areaActions] = useAreas(dataPath)
  const [lineageState, lineageActions, results] = useLineages(dataPath, data)
  const [
    { date, playing },
    { setDate, setPlaying, persistDate }
  ] = useDates(results ? results.dates : [], data.initialDate, data.frameLength)

  const handleOnClick = (area) => {
    areaActions.load(area)
  }

  const parameter_options = data.parameters.map((x) => <option key={x.id} value={x.id}>{x.display}</option>)

  const isMobile = useMobile()
  const [mobileView, setMobileView] = useMobileView(isMobile)

  const locationFilter = useMemo(() => {
    if (areaState.currentArea === 'overview') {
      return {
        category: data.overview.category,
        heading: data.overview.heading,
        subheading: (
          <span className='flex items-center text-subheading'>
            Explore {data.overview.subnoun_plural} {
            isMobile
              ? <button onClick={() => setMobileView('map')} className='px-1 underline text-primary font-medium'>on the map</button>
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
      overviewButtonText: AreaLookupTable.overview,
      loadOverview: () => areaActions.load('overview')
    }
  }, [areaState, isMobile, AreaLookupTable.overview])

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

  const lineageFilter = useLineageFilter(unique_lineages, data.colors)

  return (
    <>
      { mobileView === 'chart' &&
        <LocationFilter
          className='px-4 pt-3 pb-0 bg-white relative z-10 h-22'
          {...locationFilter}
          loading={isInitialLoad}
        /> }
      { !isMobile &&
        <FilterSection className='-mt-18 max-w-full mx-auto' loading={isInitialLoad}>
          <Card className='w-80 box-content flex-shrink-0'>
            <DateFilter {...dateFilter} />
          </Card>
          <Card className='w-80 box-content flex-shrink-0'>
            <LocationFilter className='relative' {...locationFilter} loading={areaState.status === 'LOADING'} />
          </Card>
          <Card className='box-content flex-shrink-0 xl:flex-shrink'>
            <LineageFilter className='h-20' {...lineageFilter} />
          </Card>
        </FilterSection> }
      <Card className={classNames('relative flex-grow flex flex-col md:grid md:grid-cols-2 md:grid-rows-1-full md:gap-6 pt-3 md:px-6 md:py-6', { 'pb-0': mobileView === 'map' })}>
        <div className={classNames('flex flex-col flex-grow', { hidden: mobileView === 'chart' })}>
          <div className='flex justify-between items-center space-x-3 overflow-hidden'>
            <Heading>Map</Heading>
            { isMobile &&
              <div className='flex items-center max-w-none min-w-0'>
                <FadeTransition in={areaState.status === 'LOADING'}>
                  <Spinner className='h-4 w-4 mr-2 text-gray-500' />
                </FadeTransition>
                <PillButton
                  className='flex items-center space-x-1 min-w-0 h-8 pr-2'
                  onClick={() => setMobileView('chart')}
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
              hidden: mobileView === 'map',
              'delay-1000 opacity-50 pointer-events-none': areaState.status === 'LOADING' && !isInitialLoad
            }
          )}
          name={AreaLookupTable[areaState.currentArea]}
          date={date}
          setDate={persistDate}
          selected_area={areaState.currentArea}
          values={areaState.data}
          isMobile={isMobile}
          lineColor={lineColor}
          activeLineages={lineageFilter.activeLineages}
        />
        { mobileView === 'chart' &&
          <StickyMobileSection className='overflow-x-hidden -mx-3 px-4 pt-3'>
            <LineageFilter {...lineageFilter} />
            <div className='grid place-items-center h-18'>
              <PillButton onClick={() => setMobileView('map')}>
                View map on {formattedDate}
              </PillButton>
            </div>
          </StickyMobileSection> }
        <FadeTransition in={isInitialLoad}>
          <div className='bg-white bg-opacity-50 absolute inset-0 md:rounded-md' />
        </FadeTransition>
      </Card>
      { mobileView === 'map' &&
        <DateFilter
          className='p-3 bg-white shadow border-t border-gray-100 relative z-10'
          {...dateFilter}
        /> }
    </>
  )
}

export default UI
