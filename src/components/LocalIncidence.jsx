import React from "react";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ComposedChart, Area } from 'recharts';
import _ from 'lodash';
import moment from "moment";
import memoize from 'memoize-one';

function get_lad_data(dataframe, lad, lineage) {
  console.log('calling get')
  //const lad_data = dataframe.where((item) => item.location === lad ).where((item) => item.parameter === "lambda" ).where((item) => item.lineage === lineage ).toArray()
  const lad_data = dataframe.where((item) => item.location === lad).where((item) => item.parameter === "lambda").where((item) => item.lineage !== "total")
  return (lad_data)
}

var memoized_get_lad_data = memoize(get_lad_data)

function LocalIncidence({ dataframe, lad, date, name, lineage }) {
  console.log(lad)
  let lad_data2 = memoized_get_lad_data(dataframe, lad, lineage)
  window.lad_data = lad_data2
  let lad_data = lad_data2.toArray()
  console.log(lad_data)
  window.df3 = dataframe
  window.df4 = lad_data


  const data = lad_data
  const grouped = _.groupBy(data, "date"); // creates an object where the key is the Time and the values are arrays of rows with that Time
  const for_lambda = []; // array to store the resulting data
  let lineages = new Set()
  for (const [key, value] of Object.entries(grouped)) { // loop over each group, key is the Time of the group, value is an array of rows for that Time
    const row = { date: key };
    for (const item of value) {
      row[item.lineage] = item.mean;
      row[item.lineage + "_range"] = item.range;
      lineages.add(item.lineage)
    }
    for_lambda.push(row);
  }
  console.log(lineages)
  lineages = Array.from(lineages);
  window.lineages = lineages
  const colors = ['red', 'green', 'blue', 'orange', 'pink']

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload) {
      console.log(label)
      return (
        <div className="custom-tooltip">
          {label}
          {payload.map((value, index) => {
            if (value.name != "_range") {
              return (
                <div style={{ 'color': value.stroke }} className="label">{`${value.name} : ${value.value}`}</div>)
            }
          }
          )}

        </div>
      );
    }

    return null;
  };

  return (<div>
    <h2>Local incidences</h2>
    <p className="lead">Local Authority: {name}</p>



    <ComposedChart data={for_lambda} width={500} height={200}>
      <CartesianGrid stroke="#ccc" />


      {lineages.map((value, index) => {
        console.log(value)
        return <Area type="monotone" name="_range" dataKey={value + "_range"} fill={colors[index]} strokeWidth={0} />
      })}
      {lineages.map((value, index) => {
        console.log(value)
        return <Line dot={false} name={value} type="monotone" dataKey={value} stroke={colors[index]} />
      })}


      <XAxis dataKey="date" />
      <YAxis />
      <ReferenceLine x={date} stroke="#aaa" label="" strokeWidth={1} strokeDasharray="3 3" />

      <Tooltip content={CustomTooltip} />
    </ComposedChart>

    {/*lad={lad}
      date={date}
      x={lad_data
        .map((item) => moment(item.date).format("YYYY-MM-DD"))}
      y={lad_data
        .map((item) => item.mean)}
      upper={lad_data
        .map((item) => item.upper)}
      lower={lad_data
      .map((item) => item.lower)}*/}


  </div>
  );
}


export default LocalIncidence;
