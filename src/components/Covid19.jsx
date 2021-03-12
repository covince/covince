import React, { useState, useEffect } from 'react'
import memoize from 'memoize-one'
import axios from 'axios'
import * as dataForge from 'data-forge'
import format from 'date-fns/format'

import Chloropleth from './Chloropleth'
import LocalIncidence from './LocalIncidence'
import Slider from './Slider'
import PlayButton from './PlayButton'
import Card from './Card'
import Select from './Select'
import { Heading, DescriptiveHeading } from './Typography'

import { loadTiles, getLALookupTable } from '../utils/loadTiles'
import { loadData } from '../utils/loadData'
import classNames from 'classnames'

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

  const [areaData, setAreaData] = useState(null)

  if (lineageData !== null) {
    results = memoized_get_min_max(lineageData, parameter_of_interest, value_of_interest, lineage)
  }

  const [tiles, setTiles] = useState([])
  const [lad, setLad] = useState({
    lad: 'E08000006',
    data: null,
    scale: null
  })
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
        window.df = df
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
    setLad({ ...lad, lad, data: null })
    axios.get(`./data/ltla/${lad}.json`)
      .then(res => {
        const new_data = res.data.data.map(x => {
          x.range = [x.lower, x.upper]
          return (x)
        })
        const df = new dataForge.DataFrame(new_data)

        setAreaData(df)
      })
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
    if (tiles.length === 0) setTiles(loadTiles())
    if (lineageData == null) {
      carefulSetLineage(default_lineage)
    }
    if (lineageData == null) {
      handleOnClick(null, 'E08000006')
    }
  }, [tiles, lineageData])

  let lineage_options
  if (lineageData) {
    lineage_options = unique_lineages.map((x) => <option key={x}>{x}</option>)
  }
  const scale_options = [['quadratic', 'Quadratic'], ['linear', 'Linear']].map((x) => <option key={x[0]} value={x[0]}>{x[1]}</option>)
  unique_parameters = [['lambda', 'Incidence'], ['p', 'Proportion'], ['R', 'R']]
  if (lineage === 'total') {
    unique_parameters = unique_parameters.filter(x => x[0] !== 'p' && x[0] !== 'R')
  }
  const parameter_options = unique_parameters.map((x) => <option key={x[0]} value={x[0]}>{x[1]}</option>)

  const [view, setView] = useState('map')

  return (
    <>
      <div className='flex justify-between md:mb-3 md:-mt-20'>
        <Card className='w-full md:w-auto md:flex mx-auto'>
          <div className={classNames('md:w-80 md:block', view === 'map' ? 'block' : 'hidden')}>
            <div className='h-6 flex justify-between items-start'>
              <DescriptiveHeading>
                Select date
              </DescriptiveHeading>
              <button
                className='py-2 px-3 text-sm font-medium border border-solid border-gray-300 rounded md:hidden'
                onClick={() => setView('chart')}
              >
                View charts
              </button>
            </div>
            <div className='flex items-center justify-between h-6'>
              <Heading>{format(new Date(date), 'd MMMM y')}</Heading>
              <PlayButton
                className='hidden md:flex pl-2'
                playing={playing}
                toggleState={setPlaying}
              />
            </div>
            <div className='h-6 mt-2'>
              <Slider
                min={0}
                max={results ? results.unique_dates.length - 1 : 1}
                onChange={handleDateSlider}
                value={results ? results.unique_dates.indexOf(date) : 0}
                disabled={!results}
              />
              <PlayButton
                className='md:hidden mx-auto relative z-10 pl-4 pr-2 -mt-1'
                playing={playing}
                toggleState={setPlaying}
              />
            </div>
          </div>
          <div className='border border-gray-200 mx-6 hidden md:block' />
          <div className={classNames('md:w-80 md:block', view === 'chart' ? 'block' : 'hidden')}>
            <div className='h-6 flex justify-between items-start'>
              <DescriptiveHeading>
                Local authority
              </DescriptiveHeading>
              <button
                className='py-2 px-3 text-sm font-medium border border-solid border-gray-300 rounded md:hidden'
                onClick={() => setView('map')}
              >
                View map
              </button>
            </div>
            <Heading>
              {LALookupTable[lad.lad]}
            </Heading>
            <p className='text-sm leading-6 mt-1 text-gray-600 font-medium'>
              {lad.lad}
            </p>
          </div>
        </Card>
      </div>
      <Card className='md:grid grid-cols-2 gap-6 pb-0 pt-0 md:px-6 md:py-6'>
        <div className={classNames('flex flex-col h-full', { hidden: view === 'chart' })}>
          <Heading>
            Map
          </Heading>
          <form className='flex space-x-3 text-sm w-full overflow-x-auto pb-3 mt-2 md:mt-3'>
            <div>
              <label className='block font-medium mb-1'>
                Lineage
              </label>
              <Select value={lineage} name='lineages' onChange={e => carefulSetLineage(e.target.value)}>
                {lineage_options}
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
            <div>
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
            lad={lad.lad}
            tiles={tiles}
            color_scale_type={color_scale_type}
            max_val={results ? results.max_val : 0}
            min_val={results ? results.min_val : 0}
            dataframe={results ? results.dataframe_selected_parameter : null}
            date={date}
            handleOnClick={handleOnClick}
          />
        </div>
        <LocalIncidence
          className={classNames({ hidden: view === 'map' })}
          name={LALookupTable[lad.lad]}
          date={date}
          setDate={setDate}
          lad={lad.lad}
          dataframe={areaData}
          isMobile={view === 'chart'}
        />
      </Card>
    </>
  )
}

export default Covid19
