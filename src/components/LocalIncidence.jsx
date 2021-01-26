import React from "react";

import LineChart2 from "./LineChart2";

import moment from "moment";
import memoize from 'memoize-one';

function get_lad_data(dataframe, lad,lineage){
  console.log('calling get')
  const lad_data = dataframe.where((item) => item.location === lad ).where((item) => item.parameter === "lambda" ).where((item) => item.lineage === lineage ).toArray()
  return(lad_data)
}

var memoized_get_lad_data = memoize(get_lad_data)

function LocalIncidence({ dataframe, lad, date, name,lineage }) {
  console.log(lad)
  let lad_data = memoized_get_lad_data(dataframe,lad,lineage)
  console.log(lad_data)
  window.df3 = dataframe
  window.df4 = lad_data
  return (<div>
    <h2>Local incidences</h2>
    <p className="lead">Local Authority: {name}</p>
   

    <LineChart2
  
     lad={lad}
      date={date}
      x={lad_data
        .map((item) => moment(item.date).format("YYYY-MM-DD"))}
      y={lad_data
        .map((item) => item.mean)}
      upper={lad_data
        .map((item) => item.upper)}
      lower={lad_data
        .map((item) => item.lower)}
    />

  </div>
  );
}


export default LocalIncidence;
