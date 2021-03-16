import React, { useState, useEffect, useReducer } from 'react'
import memoize from 'memoize-one'
import axios from 'axios'
import * as dataForge from 'data-forge'
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

import { loadTiles, getLALookupTable } from '../utils/loadTiles'
import { loadData } from '../utils/loadData'
import useMobile from '../hooks/useMobile'
import FadeTransition from './FadeTransition'

const default_lineage = 'B.1.1.7'

const LALookupTable = getLALookupTable()

function get_min_min_max (dataframe, parameter, value_of_interest, lineage) {
  const dataframe_selected_parameter = dataframe.where(x => x.parameter === parameter)
  const series = dataframe_selected_parameter.where(x => x.mean !== undefined).getSeries(value_of_interest)

  const min_val = 0 // series.min()
  const max_val = series.max()

  const groups = dataframe_selected_parameter.groupBy(x => x.date)
  const lookup = {}
  for (const group of groups) {
    const dater = group.first().date
    lookup[dater] = group.setIndex('location')
  }

  const unique_dates = dataframe.getSeries('date').distinct().toArray()

  return {
    min_val: min_val, max_val: max_val, dataframe_selected_parameter: lookup, series: series, unique_dates: unique_dates
  }
}

const memoized_get_min_max = memoize(get_min_min_max)
const Covid19 = () => {
  const unique_lineages = loadData().lineages
  let results

  const [playing, setPlaying] = useState(false)
  if (playing) {
    clearTimeout(window.timeout)
    window.timeout = setTimeout(x => {
      bump_date()
    }, 100)
  }

  ///  [data, indexed_by_date, unique_dates, min_val, max_val]
  const [parameter, setParameter] = useState('p')
  let unique_parameters = ['lambda', 'p', 'R']
  const parameter_of_interest = parameter
  const value_of_interest = 'mean'

  const [lineage, setLineage] = useState(default_lineage)
  const [lineageData, setLineageData] = useState(null)

  if (lineageData !== null) {
    results = memoized_get_min_max(lineageData, parameter_of_interest, value_of_interest, lineage)
  }

  const [tiles, setTiles] = useState([])

  const [ladState, dispatch] = useReducer((state, { type, payload }) => {
    if (state.status === 'LOADING') {
      switch (type) {
        case 'DATA':
          return {
            ...state,
            status: 'READY',
            loadingLad: null,
            currentLad: state.loadingLad,
            data: payload
          }
        default:
          return state
      }
    }
    switch (type) {
      case 'LOAD':
        return {
          ...state,
          status: 'LOADING',
          loadingLad: payload
        }
      default:
        return state
    }
  }, {
    status: 'INIT',
    loadingLad: null,
    currentLad: null,
    data: null
  })

  useEffect(() => {
    console.log(ladState)
    if (ladState.loadingLad === null) {
      return
    }
    axios.get(`./data/ltla/${ladState.loadingLad}.json`)
      .then(res => {
        const new_data = res.data.data.map(x => {
          x.range = [x.lower, x.upper]
          return (x)
        })
        const df = new dataForge.DataFrame(new_data)
        dispatch({ type: 'DATA', payload: df })
      })
  }, [ladState])

  const [date, setDate] = useState('2020-09-01')
  const [color_scale_type, setScale] = useState('linear')

  const carefulSetLineage = (x) => {
    if (x === 'total') {
      setParameterAndChangeScale('lambda')
      console.log('Changing parameter as total only supports lambda')
    }

    axios.get(`./data/lineage/${x}.json`)
      .then(res => {
        const df = new dataForge.DataFrame(res.data.data)
        setLineageData(df)
      })

    setLineage(x)
  }

  const setParameterAndChangeScale = (x) => {
    setParameter(x)
    if (x === 'p') { setScale('linear') }
    if (x === 'lambda') { setScale('quadratic') }
    if (x === 'R') { setScale('linear') }
  }

  const handleOnClick = (e, lad) => {
    dispatch({ type: 'LOAD', payload: lad })
  }

  const handleDateSlider = (e) => {
    const { value } = e.target
    const set_to = results.unique_dates[value]
    setDate(set_to)
  }

  const bump_date = (e) => {
    let cur_index = results.unique_dates.indexOf(date)
    if (results.unique_dates[cur_index + 1] === undefined) {
      cur_index = -1
    }
    const set_to = results.unique_dates[cur_index + 1]
    setDate(set_to)
  }

  useEffect(() => {
    setTiles(loadTiles())
    carefulSetLineage(default_lineage)
    dispatch({ type: 'LOAD', payload: 'E08000006' })
  }, [])

  const scale_options = [['quadratic', 'Quadratic'], ['linear', 'Linear']].map((x) => <option key={x[0]} value={x[0]}>{x[1]}</option>)
  unique_parameters = [['lambda', 'Incidence'], ['p', 'Proportion'], ['R', 'R']]
  if (lineage === 'total') {
    unique_parameters = unique_parameters.filter(x => x[0] !== 'p' && x[0] !== 'R')
  }
  const parameter_options = unique_parameters.map((x) => <option key={x[0]} value={x[0]}>{x[1]}</option>)

  const [view, setView] = useState('map')

  const isMobile = useMobile()

  return (
    <>
      <div className={classNames('flex md:mb-3 md:-mt-20 md:order-none', { 'order-last': view === 'map' })}>
        <Card className='w-full md:w-auto md:flex mx-auto'>
          <div className={classNames('md:w-80 md:block', view === 'map' ? 'block' : 'hidden')}>
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
                max={results ? results.unique_dates.length - 1 : 1}
                onChange={handleDateSlider}
                value={results ? results.unique_dates.indexOf(date) : 0}
                disabled={!results}
              />
            </div>
          </div>
          <div className='border border-gray-200 mx-6 hidden md:block' />
          <div className={classNames('md:w-80 md:block', view === 'chart' ? 'block' : 'hidden')}>
            <div className='h-6 flex justify-between items-start'>
              <DescriptiveHeading>
                Local authority
              </DescriptiveHeading>
              { isMobile
                ? <Button onClick={() => setView('map')}>
                  View map
                </Button>
                : <FadeTransition in={ladState.status === 'LOADING'}>
                  <Spinner className='text-gray-700 w-6 h-6' />
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
      <Card className={classNames('flex flex-col md:grid md:grid-cols-2 gap-6 pt-3 md:px-6 md:py-6', { 'pb-0': view === 'map' })}>
        <div className={classNames('flex flex-col flex-grow', { hidden: view === 'chart' })}>
          <div className='flex justify-between items-start'>
            <Heading>
              Map
            </Heading>
            { isMobile
              ? <Button onClick={() => setView('chart')}>
                View charts
              </Button>
              : <FadeTransition in={lineageData === null}>
                <Spinner className='text-gray-700 w-8 h-8' />
              </FadeTransition> }
          </div>
          <form className={classNames(
            'grid grid-cols-3 gap-3 max-w-md lg:flex lg:gap-0 lg:space-x-3 lg:max-w-none text-sm pb-3 mt-2 md:mt-3 transition-opacity',
            { 'opacity-50 pointer-events-none': lineageData === null }
          )}>
            <div>
              <label className='block font-medium mb-1'>
                Lineage
              </label>
              <Select value={lineage} name='lineages' onChange={e => carefulSetLineage(e.target.value)}>
                {unique_lineages.map((x) => <option key={x}>{x}</option>)}
              </Select>
            </div>
            <div>
              <label className='block font-medium mb-1'>
                Color by
              </label>
              <Select value={parameter} name='parameters' onChange={e => setParameterAndChangeScale(e.target.value)}>
                {parameter_options}
              </Select>
            </div>
            <div className='pr-px'>
              <label className='block font-medium mb-1'>
                Scale
              </label>
              <Select value={color_scale_type} name='color_scale_type' onChange={e => setScale(e.target.value)}>
                {scale_options}
              </Select>
            </div>
          </form>
          <Chloropleth
            className='flex-grow -mx-3 md:m-0'
            lad={ladState.currentLad}
            tiles={tiles}
            color_scale_type={color_scale_type}
            max_val={results ? results.max_val : 0}
            min_val={results ? results.min_val : 0}
            dataframe={results ? results.dataframe_selected_parameter : null}
            date={date}
            handleOnClick={handleOnClick}
            isMobile={isMobile}
          />
        </div>
        <div className='relative'>
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
        </div>
      </Card>
    </>
  )
}

export default Covid19
