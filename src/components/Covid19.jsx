import React, { useState, useEffect } from 'react'
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

const Covid19 = () => {
  const unique_lineages = loadData().lineages

  const [playing, setPlaying] = useState(false)
  const [date, setDate] = useState('2020-09-07')

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

  const handleOnClick = (e, lad) => {
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

  return (
    <>
      <div className={classNames('flex md:mb-3 md:-mt-20 md:order-none', { 'order-last': view === 'map' })}>
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
                Local authority
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
              {LALookupTable[ladState.currentLad]}
            </Heading>
            <p className='text-sm leading-6 mt-1 text-gray-600 font-medium'>
              {ladState.currentLad}
            </p>
          </div>
        </Card>
      </div>
      <Card className={classNames('flex flex-col md:grid md:grid-cols-2 md:gap-6 pt-3 md:px-6 md:py-6', { 'pb-0': view === 'map' })}>
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
                value={lineageState.lineage}
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
                value={lineageState.parameter}
                name='parameters'
                onChange={e => lineageActions.colorBy(e.target.value)}
              >
                {parameter_options}
              </Select>
            </div>
            <div className='pr-px'>
              <label className='block font-medium mb-1'>
                Scale
              </label>
              <Select
                value={lineageState.scale} name='color_scale_type' onChange={e => lineageActions.setScale(e.target.value)}>
                <option value='quadratic'>Quadratic</option>
                <option value='linear'>Linear</option>
              </Select>
            </div>
          </form>
          <div className='relative flex-grow -mx-3 md:m-0 flex flex-col'>
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
            />
            <FadeTransition in={lineageState.status === 'LOADING'}>
              <div className='bg-white bg-opacity-50 absolute inset-0 grid place-content-center'>
                <Spinner className='text-gray-700 w-8 h-8' />
              </div>
            </FadeTransition>
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
          dataframe={ladState.data}
          isMobile={isMobile}
        />
      </Card>
    </>
  )
}

export default Covid19
