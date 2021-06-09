import React, { useCallback, useMemo } from 'react'
import classNames from 'classnames'
import format from 'date-fns/format'
import { BsArrowRightShort, BsMap, BsArrowCounterclockwise } from 'react-icons/bs'

import Chloropleth from './Chloropleth'
import LocalIncidence from './LocalIncidence'
import Card from './Card'
import Select from './Select'
import { Heading } from './Typography'
import { PillButton, Button } from './Button'
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
import useAreaList from '../hooks/useAreaList'
import useChartZoom from '../hooks/useChartZoom'

import getConfig from '../config'

const UI = ({ lineColor = 'blueGray', tiles, data, dataPath, lastModified }) => {
  const config = getConfig()
  const areaLookupTable = useAreaLookupTable(tiles, config.ontology)

  const unique_lineages = data.lineages

  const [areaState, areaActions] = useAreas(dataPath)
  const [lineageState, lineageActions, results] = useLineages(dataPath, config.map.settings, unique_lineages)
  const [
    { date, playing },
    { setDate, setPlaying, persistDate }
  ] = useDates(results ? results.dates : [], config.timeline)

  const handleOnClick = useCallback((area_id) => {
    areaActions.load(area_id)
  }, [areaActions.load])

  const parameter_options = config.parameters.map((x) => <option key={x.id} value={x.id}>{x.display}</option>)

  const isMobile = useMobile()
  const [mobileView, setMobileView] = useMobileView(isMobile)

  const areaList = useAreaList(results, areaLookupTable)

  const isInitialLoad = useMemo(() => (
    lineageState.lineage === null || areaState.currentArea === null
  ), [lineageState.lineage, areaState.currentArea])

  const locationFilter = useMemo(() => {
    const { ontology } = config

    const props = {
      loading: isInitialLoad || areaState.status === 'LOADING',
      areaList,
      onChange: areaActions.load,
      value: areaState.currentArea,
      overview: ontology.overview
    }

    if (areaState.currentArea === 'overview') {
      return {
        ...props,
        category: ontology.overview.category,
        heading: ontology.overview.heading,
        subheading: (
          <span className='flex items-center text-subheading'>
            Explore {ontology.area.noun_plural} {
            isMobile
              ? <button onClick={() => setMobileView('map')} className='px-1 underline text-primary font-medium'>on the map</button>
              : 'on the map'
            }
          </span>
        )
      }
    }
    return {
      ...props,
      category: ontology.area.category,
      heading: areaLookupTable[areaState.currentArea],
      subheading: areaState.currentArea,
      showOverviewButton: areaState.loadingArea !== 'overview',
      loadOverview: () => areaActions.load('overview')
    }
  }, [areaState, isMobile, areaLookupTable.overview, areaList, isInitialLoad])

  const { timeline } = config
  const formattedDate = useMemo(
    () => date ? format(new Date(date), timeline.date_format.heading) : '',
    [date]
  )
  const mobileNavDate = useMemo(
    () => date ? format(new Date(date), timeline.date_format.mobile_nav) : '',
    [date]
  )

  const dateFilter = {
    label: config.timeline.label,
    dates: results ? results.dates : null,
    heading: formattedDate,
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

  const lineageFilter = useLineageFilter(unique_lineages, config.colors)

  const formattedLastModified = useMemo(
    () => lastModified ? format(new Date(lastModified), config.datetime_format) : '',
    [lastModified]
  )

  const mapValues = useMemo(() => {
    const values = {}
    if (results === null) return values
    for (const { area, lookup } of results.values) {
      values[area] = lookup[date]
    }
    return values
  }, [results, date])

  const { chartZoom, clearChartZoom } = useChartZoom()

  return (
    <>
      { isMobile && lastModified &&
        <p className='text-xs tracking-wide leading-6 text-center text-heading'>
          Data updated <span className='font-medium'>{formattedLastModified}</span>
        </p> }
      { mobileView === 'chart' &&
        <LocationFilter
          className='px-4 pt-3 pb-0 bg-white relative z-10 h-22'
          {...locationFilter}
        /> }
      { !isMobile &&
        <FilterSection className='-mt-18 max-w-full mx-auto' loading={isInitialLoad}>
          <Card className='w-80 box-content flex-shrink-0'>
            <DateFilter {...dateFilter} />
          </Card>
          <Card className='w-80 box-content flex-shrink-0'>
            <LocationFilter className='relative' {...locationFilter} />
          </Card>
          <Card className='box-content flex-shrink-0 xl:flex-shrink'>
            <LineageFilter className='h-20' {...lineageFilter} />
          </Card>
        </FilterSection> }
      <Card className='relative flex-grow flex flex-col md:grid md:grid-cols-2 md:grid-rows-1-full md:gap-6 pt-3 pb-0 md:px-6 md:py-6'>
        <div className={classNames('flex-grow flex flex-col', { hidden: mobileView === 'chart' })}>
          <div className='flex justify-between items-center space-x-3 overflow-hidden'>
            <Heading>Map</Heading>
            { isMobile &&
              <div className='flex items-center max-w-none min-w-0'>
                <FadeTransition in={areaState.status === 'LOADING'}>
                  <Spinner className='h-4 w-4 mr-2 text-gray-500' />
                </FadeTransition>
                <PillButton
                  className='flex items-center bg-primary text-white space-x-1 min-w-0 h-8 pr-2'
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
                Colour by
              </label>
              <Select
                value={lineageState.loading.colorBy || lineageState.colorBy}
                name='parameters'
                onChange={e => lineageActions.colorBy(e.target.value)}
              >
                {parameter_options}
              </Select>
            </div> {lineageState.scale !== undefined &&
              <div>
                <label className='block font-medium mb-1'>
                  Colour Scale
                </label>
                <Select
                  value={lineageState.scale || ''}
                  name='color_scale_type'
                  onChange={e => lineageActions.setScale(e.target.value)}
                >
                  <option value='linear'>Linear</option>
                  <option value='quadratic'>Quadratic</option>
                </Select>
              </div> }
          </form>
          <div className='relative flex-grow -mx-3 md:m-0 flex flex-col md:rounded-md overflow-hidden'>
            <Chloropleth
              className='flex-grow'
              selected_area={areaState.loadingArea || areaState.currentArea}
              geojson={tiles}
              config={config.map.viewport}
              color_scale_type={lineageState.colorBy === 'R' ? 'R_scale' : lineageState.scale}
              max_val={results ? results.max : 0}
              min_val={results ? results.min : 0}
              values={mapValues}
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
        <div className={classNames('flex-grow flex flex-col relative', { hidden: mobileView === 'map' })}>
          { !isMobile &&
            <FadeTransition in={!!chartZoom}>
              <div className='absolute left-0 right-0 -top-6 h-0 flex'>
                <Button
                  onClick={clearChartZoom}
                  className='ml-auto mr-4 -mt-1.5 h-6 pl-1.5 pr-1.5 flex items-center text-primary hover:bg-gray-50'
                >
                  <BsArrowCounterclockwise className='h-4 w-4 mr-1' />
                  <span className='text-xs tracking-wide font-medium'>Reset date range</span>
                </Button>
              </div>
            </FadeTransition> }
          <LocalIncidence
            chartDefinitions={config.charts}
            className={classNames(
              'transition-opacity flex-grow', {
                'delay-1000 opacity-50 pointer-events-none': areaState.status === 'LOADING' && !isInitialLoad
              }
            )}
            name={areaLookupTable[areaState.currentArea]}
            date={date}
            setDate={persistDate}
            selected_area={areaState.currentArea}
            values={areaState.data}
            isMobile={isMobile}
            lineColor={lineColor}
            activeLineages={lineageFilter.activeLineages}
          />
          { !isMobile && lastModified &&
            <div className='self-end mt-1 -mb-6 -mr-6 px-2 border-t border-l border-gray-200 rounded-tl-md h-6'>
              <p className='text-xs tracking-wide leading-6 text-heading'>
                Data updated <span className='font-medium'>{formattedLastModified}</span>
              </p>
            </div> }
        </div>
        { mobileView === 'chart' &&
          <StickyMobileSection className='overflow-x-hidden -mx-3 px-4 py-3'>
            <LineageFilter {...lineageFilter} />
            <div
              className={classNames(
                'grid items-center gap-3 grid-flow-col h-12 box-content pt-1 _gap-3',
                chartZoom ? 'auto-cols-fr' : 'justify-center'
              )}
            >
              <PillButton onClick={() => setMobileView('map')} className='flex items-center justify-center bg-primary text-white'>
                <BsMap className='h-5 w-5 mr-2 flex-shrink-0' />
                View map
                {!chartZoom && <span>&nbsp;on {mobileNavDate}</span>}
              </PillButton>
              { chartZoom &&
                <PillButton onClick={clearChartZoom} className='flex justify-center border border-gray-300 text-gray-700'>
                  <span className='whitespace-nowrap truncate font-medium'>Reset date range</span>
                </PillButton> }
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
