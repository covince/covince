import React, { useState, useEffect } from "react";
import Spinner from "./Spinner";
import Chloropleth from "./Chloropleth";
import LocalIncidence from "./LocalIncidence";

import Slider from "rc-slider";


import "rc-slider/assets/index.css";

import { loadTiles, getLALookupTable } from "../utils/loadTiles";
import { loadData } from "../utils/loadData";
import { min } from "moment";
import memoize from 'memoize-one';
import axios from 'axios';

const dataForge = require('data-forge');

let default_lineage = "B.1.1.7"

let LALookupTable = getLALookupTable()

function get_min_min_max(dataframe, parameter, value_of_interest, lineage) {

  let dataframe_selected_parameter = dataframe.where(x => x.parameter == parameter)
  const series = dataframe_selected_parameter.where(x => x['mean'] != undefined).getSeries(value_of_interest)

  const min_val = 0 // series.min()
  const max_val = series.max()


  let groups = dataframe_selected_parameter.groupBy(x => x.date);
  let lookup = {}
  for (const group of groups) {

    const dater = group.first().date;
    lookup[dater] = group.setIndex('location')

  }

  const unique_dates = dataframe.getSeries('date').distinct().toArray()

  return {
    'min_val': min_val, 'max_val': max_val, 'dataframe_selected_parameter': lookup, 'series': series, 'unique_dates': unique_dates
  }


}


var memoized_get_min_max = memoize(get_min_min_max)
let lists = loadData();
const Covid19 = ({ playing }) => {
  let unique_lineages = loadData()['lineages']
  let results
  console.log('playing', playing)
  if (playing) {
    clearTimeout(window.timeout)
    window.timeout = setTimeout(x => {
      bump_date()
      console.log('date bumped')
    }, 100)
  }




  ///  [data, indexed_by_date, unique_dates, min_val, max_val] 
  const [parameter, setParameter] = useState("p");
  let unique_parameters = ['lambda', 'p', 'R']
  const parameter_of_interest = parameter
  const value_of_interest = "mean"

  const [lineage, setLineage] = useState(default_lineage);
  const [lineageData, setLineageData] = useState(null);

  const [areaData, setAreaData] = useState(null);

  if (lineageData !== null) {
    console.log('hi')
    results = memoized_get_min_max(lineageData, parameter_of_interest, value_of_interest, lineage)
    
  }


  const [is_playing, setIsPlaying] = useState(false);


  const [tiles, setTiles] = useState([]);
  const [lad, setLad] = useState({
    lad: "E08000006",
    data: null,
    scale: null,
  });
  const [date, setDate] = useState({
    date: "2020-09-01",

  });

  const [color_scale_type, setScale] = useState("linear");

  const carefulSetLineage = (x) => {

    if (x === "total") {
      setParameterAndChangeScale("lambda");
      console.log("Changing parameter as total only supports lambda")
    }

    axios.get(`./data/lineage/${x}.json`)
      .then(res => {
       
        const df = new dataForge.DataFrame(res.data.data)
        window.df = df
        setLineageData(df)
        console.log("got res")
      });


    setLineage(x);
  }

  const setParameterAndChangeScale = (x) => {
    setParameter(x);
    if (x === "p") { setScale("linear") }
    if (x === "lambda") { setScale("quadratic") }
    if (x === "R") { setScale("linear") }
  }

  const handleOnClick = (e, lad) => {
    setLad({ ...lad, lad, data: null });
    axios.get(`./data/ltla/${lad}.json`)
      .then(res => {
       
        const new_data = res.data.data.map(x => {
          x.range = [x.lower,x.upper];
          return(x)
        } )
        const df = new dataForge.DataFrame(new_data)
      
        setAreaData(df)
        console.log("got area res")
      });
  };

  const handleDateSlider = (e) => {
    const set_to = results['unique_dates'][e];

    setDate({ date: set_to });


  };


  const bump_date = (e) => {
    let cur_index = results['unique_dates'].indexOf(date.date)
    if (results['unique_dates'][cur_index + 1] == undefined) {
      cur_index = -1
    }
    const set_to = results['unique_dates'][cur_index + 1]
    setDate({ date: set_to });


  };

  function togglePlay() {

    if (is_playing) {
      setIsPlaying(false)
      clearInterval(window.bumpTimeout)
    }
    else {
      setIsPlaying(true)
      window.bumpTimeout = setInterval(() => this.bump_date(), 100);
    }

  }







  useEffect(() => {
    if (tiles.length === 0) setTiles(loadTiles());
    if (lineageData == null) {
      carefulSetLineage(default_lineage)
    }
    if (lineageData == null) {
      handleOnClick(null,"E08000006")
    }

  }, [tiles, lineageData]);

  let lineage_options
  if (lineageData) {
    lineage_options = unique_lineages.map((x) => <option>{x}</option>)
  }
  const scale_options = [['quadratic', 'Quadratic'], ['linear', 'Linear']].map((x) => <option value={x[0]}>{x[1]}</option>)
  unique_parameters = [['lambda', 'Incidence'], ['p', 'Proportion'], ['R', 'R']]
  if (lineage === "total") {
    unique_parameters = unique_parameters.filter(x => x[0] !== "p" && x[0] !== "R")
  }
  const parameter_options = unique_parameters.map((x) => <option value={x[0]}>{x[1]}</option>)


  return (

    <React.Fragment>
      {( lineageData==null| areaData==null )  ? (
        <div className="row">
          <Spinner />
        </div>
      ) : (
          <div className="row">
            <div className="col-md-6">
              <h2>Select date</h2>
              <p className="lead">Current date: {date.date}</p>

              <Slider
                min={0}
                max={results['unique_dates'] && results['unique_dates'].length - 1}
                onChange={handleDateSlider}
                value={results['unique_dates'].indexOf(date.date)}
              />
              <hr />
              <h2>Map</h2>
              <div class='map_controls'>
                Lineage: <select value={lineage} name="lineages" onChange={e => carefulSetLineage(e.target.value)}>
                  {lineage_options}
                </select>&nbsp;&nbsp;&nbsp;
              Color by: <select value={parameter} name="parameters" onChange={e => setParameterAndChangeScale(e.target.value)}>
                  {parameter_options}&nbsp;
              </select>
              </div>
              <Chloropleth
                lad={lad.lad}
                tiles={tiles}
                color_scale_type={color_scale_type}
                max_val={results['max_val']}
                min_val={results['min_val']}
                dataframe={results['dataframe_selected_parameter']}
                date={date.date}
                scale={date.scale}
                handleOnClick={handleOnClick}
              />
              <div class='scale_control_holder'>
                Scale:&nbsp;<select value={color_scale_type} name="color_scale_type" onChange={e => setScale(e.target.value)}>
                  {scale_options}
                </select>
              </div></div>

            <div className="col-md-6">


              {<LocalIncidence name={LALookupTable[lad.lad]} date={date.date} lad={lad.lad} dataframe={areaData} lineage={lineage} />}

            </div>
          </div>
        )}
    </React.Fragment>
  );
};

export default Covid19;
