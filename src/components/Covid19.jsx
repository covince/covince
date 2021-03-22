import React, { useState, useEffect, useMemo } from 'react'
import format from 'date-fns/format'
import classNames from 'classnames'

import Chloropleth from './Chloropleth'
import LocalIncidence from './LocalIncidence'
import Slider from './Slider'
import PlayButton from './PlayButton'
import Card from './Card'
import Select from './Select'
import { Heading, DescriptiveHeading } from './Typography'
import Button from './Button'
import Spinner from './Spinner'
import FadeTransition from './FadeTransition'

import { loadTiles, getLALookupTable } from '../utils/loadTiles'
import { loadData } from '../utils/loadData'
import useMobile from '../hooks/useMobile'
import useLADs from '../hooks/useLADs'
import useLineages from '../hooks/useLineages'

const LALookupTable = getLALookupTable()
const tiles = loadTiles()
const data = loadData()

const Covid19 = ({ lineColor = 'blueGray' }) => {
  const unique_lineages = data.lineages

  const [playing, setPlaying] = useState(false)
  const [date, setDate] = useState(data.initialDate)

  const [ladState, ladActions] = useLADs()
  const [lineageState, lineageActions, results] = useLineages()

  const bumpDate = () => {
    let cur_index = results.dates.indexOf(date)
    if (results.dates[cur_index + 1] === undefined) {
      cur_index = -1
    }
    const set_to = results.dates[cur_index + 1]
    setDate(set_to)
  }

  useEffect(() => {
    if (playing) {
      const timeout = setTimeout(bumpDate, 100)
      return () => clearTimeout(timeout)
    }
  }, [playing, date])

  let unique_parameters = ['lambda', 'p', 'R']

  const handleOnClick = (lad) => {
    ladActions.load(lad)
  }

  const handleDateSlider = (e) => {
    const { value } = e.target
    const set_to = results.dates[value]
    setDate(set_to)
  }

  unique_parameters = [['lambda', 'Incidence'], ['p', 'Proportion'], ['R', 'R']]
  if (lineageState.lineage === 'total') {
    unique_parameters = unique_parameters[0]
  }
  const parameter_options = unique_parameters.map((x) => <option key={x[0]} value={x[0]}>{x[1]}</option>)

  const [view, setView] = useState('map')
  const isMobile = useMobile()

  const locationFilter = useMemo(() => {
    if (ladState.currentLad === 'national') {
      return {
        category: 'National overview',
        heading: 'England',
        subheading: (
          <span className='flex items-center text-subheading'>
            Select a local authority to explore
          </span>
        )
      }
    }
    return {
      category: 'Local authority',
      heading: LALookupTable[ladState.currentLad],
      subheading: ladState.currentLad
    }
  }, [ladState.currentLad])

  return (
    <>
      <div className={classNames('flex md:mb-3 md:-mt-20 md:order-none md:sticky md:top-1 md:z-10', { 'order-last': view === 'map' })}>
        <Card className='w-full md:w-auto md:flex mx-auto'>
          <div className={classNames('md:w-80 md:block', { hidden: view !== 'map' })}>
            <div className='h-6 flex justify-between items-start'>
              <DescriptiveHeading>
                Select date
              </DescriptiveHeading>
              <PlayButton
                playing={playing}
                toggleState={setPlaying}
              />
            </div>
            <div className='flex items-center justify-between h-6'>
              <Heading>{format(new Date(date), 'd MMMM y')}</Heading>
            </div>
            <div className='h-6 mt-2'>
              <Slider
                min={0}
                max={results ? results.dates.length - 1 : 1}
                onChange={handleDateSlider}
                value={results ? results.dates.indexOf(date) : 0}
                disabled={!results}
              />
            </div>
          </div>
          <div className='border border-gray-200 mx-6 hidden md:block' />
          <div className={classNames('md:w-80 md:block', view === 'chart' ? 'block' : 'hidden')}>
            <div className='h-6 flex justify-between items-start relative'>
              <DescriptiveHeading>
                {locationFilter.category}
              </DescriptiveHeading>
              { isMobile
                ? <Button onClick={() => setView('map')}>
                  View map
                </Button>
                : <FadeTransition in={ladState.status === 'LOADING'}>
                  <Spinner className='text-gray-700 w-6 h-6 absolute top-0 right-0' />
                </FadeTransition> }
            </div>
            <Heading>
              {locationFilter.heading}
            </Heading>
            <p className='text-sm leading-6 mt-1 text-gray-600 font-medium'>
              {locationFilter.subheading}
            </p>
          </div>
        </Card>
      </div>
      <Card className={classNames('flex flex-col md:grid md:grid-cols-2 md:grid-rows-1-full md:gap-6 pt-3 md:px-6 md:py-6', { 'pb-0': isMobile && view === 'map' })}>
        <div className={classNames('flex flex-col flex-grow', { hidden: view === 'chart' })}>
          <div className='flex justify-between items-start'>
            <Heading>Map</Heading>
            { isMobile &&
              <Button onClick={() => setView('chart')}>
                View charts
              </Button> }
          </div>
          <form className={classNames(
            'grid grid-cols-3 gap-3 max-w-md lg:flex lg:gap-0 lg:space-x-3 lg:max-w-none text-sm pb-3 mt-2 md:mt-3 transition-opacity',
            { 'opacity-50 pointer-events-none': lineageState.status === 'LOADING' }
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
                value={lineageState.loading.parameter || lineageState.parameter}
                name='parameters'
                onChange={e => lineageActions.colorBy(e.target.value)}
              >
                {parameter_options}
              </Select>
            </div>
            <div>
              <label className='block font-medium mb-1'>
                Scale
              </label>
              <Select
                value={lineageState.scale}
                name='color_scale_type'
                onChange={e => lineageActions.setScale(e.target.value)}
              >
                <option value='linear'>Linear</option>
                <option value='quadratic'>Quadratic</option>
              </Select>
            </div>
          </form>
          <div className='relative flex-grow -mx-3 md:m-0 flex flex-col md:rounded-md overflow-hidden'>
            <Chloropleth
              className='flex-grow'
              lad={ladState.loadingLad || ladState.currentLad}
              tiles={tiles}
              color_scale_type={lineageState.scale}
              max_val={results ? results.max : 0}
              min_val={results ? results.min : 0}
              index={results ? results.index : null}
              date={date}
              handleOnClick={handleOnClick}
              isMobile={isMobile}
              percentage={lineageState.parameter === 'p'}
              lineColor={lineColor}
            />
            <FadeTransition in={lineageState.status === 'LOADING'}>
              <div className='bg-white bg-opacity-50 absolute inset-0 grid place-content-center'>
                <Spinner className='text-gray-700 w-8 h-8' />
              </div>
            </FadeTransition>
            <div className='absolute inset-0 shadow-inner pointer-events-none' />
          </div>
        </div>
        <LocalIncidence
          className={classNames(
            'transition-opacity', {
              hidden: view === 'map',
              'opacity-50 pointer-events-none': ladState.status === 'LOADING'
            }
          )}
          name={LALookupTable[ladState.currentLad]}
          date={date}
          setDate={setDate}
          lad={ladState.currentLad}
          values={ladState.data}
          isMobile={isMobile}
          lineColor={lineColor}
        />
      </Card>
    </>
  )
}

export default Covid19
