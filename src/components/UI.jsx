import React, { useCallback, useMemo } from 'react'
import classNames from 'classnames'
import format from 'date-fns/format'
import { BsArrowRightShort, BsMap, BsArrowCounterclockwise } from 'react-icons/bs'

import { Heading } from './Typography'
import { Button, PrimaryPillButton, SecondaryPillButton } from './Button'
import Card from './Card'
import Select from './Select'
import Spinner from './Spinner'
import FadeTransition from './FadeTransition'
import LoadingOverlay from './LoadingOverlay'

import { InjectionContext, useInjection } from '../components'
import { useMobile } from '../hooks/useMediaQuery'
import useChartData from '../hooks/useChartData'
import useMapData from '../hooks/useMapData'
import useAreaLookupTable from '../hooks/useAreaLookupTable'
import useDates from '../hooks/useDates'
import useMobileView from '../hooks/useMobileView'
import useLineageFilter from '../hooks/useLineageFilter'
import useChartZoom from '../hooks/useChartZoom'
import useLocationSearch from '../hooks/useLocationSearch'

import { ConfigContext } from '../config'

export const UI = ({
  api,
  data = { lineages: [] }, // legacy API, prefer to pass lineages directly
  config,
  darkMode,
  lastModified,
  lineages = data.lineages,
  lineColor = 'blueGray',
  tiles
}) => {
  const [{
    Chloropleth,
    DateFilter,
    FilterSection,
    LineageFilter,
    LocalIncidence,
    LocationFilter,
    MapView,
    StickyMobileSection
  }, injectProps] = useInjection()

  const [chartDataState, chartDataActions] = useChartData(api, lineages)
  const [mapDataState, mapDataActions, results] = useMapData(api, config.map.settings, lineages)
  const [
    { date, playing },
    { setDate, setPlaying, persistDate }
  ] = useDates(results ? results.dates : [], config.timeline)

  const handleOnClick = useCallback((area_id) => {
    chartDataActions.load(area_id)
  }, [chartDataActions.load])

  const parameter_options = config.parameters.map((x) => <option key={x.id} value={x.id}>{x.display}</option>)

  const isMobile = useMobile()
  const [mobileView, setMobileView] = useMobileView(isMobile)

  const areaLookupTable = useAreaLookupTable(tiles, results, config.ontology)
  const locationSearch = useLocationSearch(areaLookupTable, config.area_search_terms)

  const isInitialLoad = useMemo(() => (
    mapDataState.lineage === null || chartDataState.area === null
  ), [mapDataState.lineage, chartDataState.area])

  const locationFilter = useMemo(() => {
    const { ontology } = config

    const props = {
      loading: isInitialLoad ||
        (chartDataState.status === 'LOADING' && (isMobile || chartDataState.loading.area !== chartDataState.area)) ||
        locationSearch.isLoading,
      onChange: chartDataActions.load,
      value: chartDataState.area,
      overview: ontology.overview
    }

    if (chartDataState.area === 'overview') {
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
      heading: areaLookupTable[chartDataState.area],
      subheading: chartDataState.area,
      showOverviewButton: chartDataState.loadingArea !== 'overview',
      loadOverview: () => chartDataActions.load('overview'),
      ...injectProps.LocationFilter
    }
  }, [chartDataState, isMobile, areaLookupTable.overview, isInitialLoad, locationSearch.isLoading, injectProps.LocationFilter])

  const { timeline } = config
  const formattedDate = useMemo(
    () => date ? format(new Date(date), timeline.date_format.heading) : '',
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
    },
    ...injectProps.DateFilter
  }

  const lineageFilter = {
    ...useLineageFilter(lineages, chartDataState.lineages, config, darkMode),
    isMobile,
    ...injectProps.LineageFilter
  }

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

  const { chartZoom, clearChartZoom, zoomEnabled, setZoomEnabled } = useChartZoom()

  const { activeLineages, sortedLineages } = lineageFilter
  const selectedLineage = mapDataState.loading.lineage || mapDataState.lineage

  const mapParameterConfig = useMemo(() => {
    const param = config.parameters.find(_ => _.id === mapDataState.colorBy)
    if (param) {
      return {
        format: param.format || mapDataState.colorBy === 'p' ? 'percentage' : undefined,
        precision: param.precision
      }
    }
    return undefined
  }, [mapDataState.colorBy])

  const fadeUncertaintyEnabled = useMemo(() => {
    const { fade_uncertainty = {} } = config.map
    return mapDataState.colorBy in fade_uncertainty ? fade_uncertainty[mapDataState.colorBy] : undefined
  }, [mapDataState.colorBy])

  return (
    <>
      { isMobile && lastModified &&
        <p className='text-xs tracking-wide leading-6 text-center text-heading'>
          Data updated <span className='font-medium'>{formattedLastModified}</span>
        </p> }
      { mobileView === 'chart' &&
        <div className='bg-white dark:bg-gray-700 px-4 pt-3 relative z-10'>
          <LocationFilter
            className='h-22'
            {...locationFilter}
            {...locationSearch}
          />
        </div> }
      { !isMobile &&
        <FilterSection className='-mt-18 max-w-full mx-auto' loading={isInitialLoad} {...injectProps.FilterSection}>
          <Card className='w-80 box-content flex-shrink-0'>
            <DateFilter {...dateFilter} />
          </Card>
          <Card className='w-80 box-content flex-shrink-0 relative'>
            <LocationFilter {...locationFilter} {...locationSearch} />
          </Card>
          <Card className='box-content flex-shrink-0 xl:flex-shrink md:pb-0'>
            <LineageFilter className='h-full flex flex-col md:-mb-3' {...lineageFilter} />
          </Card>
        </FilterSection> }
      <Card className='relative flex-grow flex flex-col md:grid md:grid-cols-2 md:grid-rows-1-full md:gap-6 pt-3 pb-0' extraPadding>
        <MapView
          isHidden={mobileView === 'chart'}
          heading={
            <div className='flex justify-between items-center space-x-3 overflow-hidden'>
              <Heading>Map</Heading>
              { isMobile &&
                <div className='flex items-center max-w-none min-w-0'>
                  <FadeTransition in={chartDataState.status === 'LOADING'}>
                    <Spinner className='h-4 w-4 mr-2 text-gray-500 dark:text-gray-200' />
                  </FadeTransition>
                  <PrimaryPillButton
                    className='flex items-center space-x-1 min-w-0 h-8 pr-2'
                    onClick={() => setMobileView('chart')}
                  >
                    <span className='truncate'>{locationFilter.heading}</span>
                    <BsArrowRightShort className='w-6 h-6 flex-shrink-0' />
                  </PrimaryPillButton>
                </div> }
            </div>
          }
          {...injectProps.MapView}
        >
          <form className={classNames(
            'grid grid-cols-3 gap-3 max-w-md lg:flex lg:gap-0 lg:space-x-3 lg:max-w-none text-sm pb-3 mt-2 md:mt-3 transition-opacity',
            { 'opacity-50 pointer-events-none': mapDataState.status === 'LOADING' && !isInitialLoad }
          )}>
            <div>
              <label className='block font-medium mb-1'>
                Lineage
              </label>
              <Select
                value={selectedLineage}
                name='lineages'
                onChange={e => mapDataActions.setLineage(e.target.value)}
              >
                {sortedLineages.map(({ lineage, altName }) =>
                  <option key={lineage} value={lineage}>
                    {altName}
                    {altName ? ` (${lineage})` : lineage}
                  </option>
                )}
              </Select>
            </div>
            <div>
              <label className='block font-medium mb-1'>
                Colour by
              </label>
              <Select
                value={mapDataState.loading.colorBy || mapDataState.colorBy}
                name='parameters'
                onChange={e => mapDataActions.colorBy(e.target.value)}
              >
                {parameter_options}
              </Select>
            </div>
            { mapDataState.scale !== undefined &&
              <div>
                <label className='block font-medium mb-1'>
                  Colour Scale
                </label>
                <Select
                  value={mapDataState.scale || ''}
                  name='color_scale_type'
                  onChange={e => mapDataActions.setScale(e.target.value)}
                >
                  <option value='linear'>Linear</option>
                  <option value='quadratic'>Quadratic</option>
                </Select>
              </div> }
          </form>
          <LoadingOverlay
            className='flex-grow -mx-3 md:m-0 flex flex-col md:rounded-md overflow-hidden'
            loading={mapDataState.status === 'LOADING' && !isInitialLoad}
          >
            <Chloropleth
              className='flex-grow'
              color_scale_type={mapDataState.colorBy === 'R' ? 'R_scale' : mapDataState.scale}
              config={config.map.viewport}
              darkMode={darkMode}
              enable_fade_uncertainty={fadeUncertaintyEnabled}
              geojson={tiles}
              handleOnClick={handleOnClick}
              isMobile={isMobile}
              lineColor={lineColor}
              max_val={results ? results.max : 0}
              min_val={results ? results.min : 0}
              parameterConfig={mapParameterConfig}
              selected_area={chartDataState.loadingArea || chartDataState.area}
              values={mapValues}
              {...injectProps.Chloropleth}
            />
            <div className='absolute inset-0 z-10 shadow-inner pointer-events-none' style={{ borderRadius: 'inherit' }} />
          </LoadingOverlay>
          {/* <div className='relative'>
            <FadeTransition in={mapDataState.status === 'LOADING' && !isInitialLoad}>
              <div className='bg-white bg-opacity-75 dark:bg-gray-700 dark:bg-opacity-75 absolute inset-0 grid place-content-center'>
                <Spinner className='text-gray-500 dark:text-gray-200 w-6 h-6' />
              </div>
            </FadeTransition>
          </div> */}
        </MapView>
        <div className={classNames('flex-grow flex flex-col relative', { hidden: mobileView === 'map' || (isMobile && locationSearch.isSearching) })}>
          { !isMobile &&
            <FadeTransition in={!!chartZoom}>
              <div className='absolute left-0 right-0 -top-6 h-0 flex'>
                <Button
                  onClick={clearChartZoom}
                  className='ml-auto mr-4 -mt-1.5 h-6 pl-1.5 pr-1.5 flex items-center text-primary hover:bg-gray-50 border-gray-300 dark:border-gray-500'
                >
                  <BsArrowCounterclockwise className='h-4 w-4 mr-1' />
                  <span className='text-xs tracking-wide font-medium'>Reset date range</span>
                </Button>
              </div>
            </FadeTransition> }
          <LocalIncidence
            className={classNames(
              'transition-opacity flex-grow', {
                'delay-1000 opacity-50 pointer-events-none': chartDataState.status === 'LOADING' && !isInitialLoad
              }
            )}
            activeLineages={activeLineages}
            chartDefinitions={config.charts}
            date={date}
            darkMode={darkMode}
            isMobile={isMobile}
            lineColor={lineColor}
            name={areaLookupTable[chartDataState.area]}
            selected_area={chartDataState.area}
            setDate={persistDate}
            values={chartDataState.data}
            zoomEnabled={isMobile ? zoomEnabled : true}
            {...injectProps.LocalIncidence}
          />
          { !isMobile && lastModified &&
            <div className='self-end mt-1 -mb-6 -mr-6 px-2 border-t border-l border-gray-200 dark:border-gray-500 rounded-tl-md h-6'>
              <p className='text-xs tracking-wide leading-6 text-heading'>
                Data updated <span className='font-medium'>{formattedLastModified}</span>
              </p>
            </div> }
        </div>
        { mobileView === 'chart' && !locationSearch.isSearching &&
          <StickyMobileSection className='overflow-x-hidden -mx-3 px-4 py-3' title='Lineages' {...injectProps.StickyMobileSection}>
            <LineageFilter {...lineageFilter} />
            <div className='grid items-center gap-3 grid-flow-col box-content mt-1 auto-cols-fr'>
              <PrimaryPillButton onClick={() => setMobileView('map')} className='flex items-center justify-center'>
                <BsMap className='h-5 w-5 mr-2 flex-shrink-0' />
                View map
              </PrimaryPillButton>
              { chartZoom
                ? <SecondaryPillButton
                  onClick={clearChartZoom}
                  className='text-center'
                >
                  <span className='whitespace-nowrap truncate font-medium'>Reset date range</span>
                </SecondaryPillButton>
                : <SecondaryPillButton
                    onClick={() => setZoomEnabled(!zoomEnabled)}
                    className={classNames(
                      'flex justify-center',
                      { 'text-primary ring ring-primary dark:ring-gray-500 ring-opacity-40 border-primary dark:border-dark-primary': zoomEnabled }
                    )}
                  >
                    <span className='whitespace-nowrap font-medium'>
                      {zoomEnabled ? 'Select range on chart' : 'Set date range'}
                    </span>
                  </SecondaryPillButton> }
            </div>
          </StickyMobileSection> }
        <FadeTransition in={isInitialLoad}>
          <div className='bg-white dark:bg-gray-700 bg-opacity-50 dark:bg-opacity-50 absolute inset-0 md:rounded-md' />
        </FadeTransition>
      </Card>
      { mobileView === 'map' &&
        <DateFilter
          className='p-3 bg-white dark:bg-gray-700 shadow border-t border-gray-100 dark:border-gray-600 relative z-10'
          {...dateFilter}
        /> }
    </>
  )
}

const emptyInjection = {}
const InitializeUI = ({ injection = emptyInjection, ...props }) => {
  return (
    <ConfigContext.Provider value={props.config}>
      <InjectionContext.Provider value={injection}>
        <UI {...props} />
      </InjectionContext.Provider>
    </ConfigContext.Provider>
  )
}

export default InitializeUI
