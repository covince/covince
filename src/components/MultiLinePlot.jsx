import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ComposedChart, Area } from 'recharts';
import _ from 'lodash';

const MultiLinePlot = ({ date, lad_data, parameter, type }) => {

  const data = lad_data.filter(x => x.parameter == parameter).filter(x => x.lineage != "total")
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

  lineages = Array.from(lineages);
  window.lineages = lineages
  const colors = ['red', 'green', 'blue', 'orange', 'pink','#e6194b', '#3cb44b', '#ffe119', '#4363d8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#9a6324', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000075', '#808080', '#ffffff', '#000000']

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload) {

      return (
        <div className="custom-tooltip">
          <div className="tooltip_header">{label}</div>
          {payload.map((value, index) => {
            if (value.name != "_range") {
              return (
                <div className="tooltip_entry" style={{ 'color': value.stroke }} >{`${value.name} : ${value.value}`}</div>)
            }
          }
          )}

        </div>
      );
    }

    return null;
  };


  if (type == "area") {
    return (<ComposedChart data={for_lambda} width={500} height={200}>
      <CartesianGrid stroke="#ccc" />

      {lineages.map((value, index) => {

        return <Area  isAnimationActive={false} stackId="1" dot={false} name={value} type="monotone" dataKey={value} fill={colors[index]} stroke={colors[index]} />
      })}


      <XAxis dataKey="date" />
      <YAxis tickFormatter={value => parseFloat(value).toFixed(2)} domain={[0, 1]} />
      <ReferenceLine x={date} stroke="#aaa" label="" strokeWidth={1} strokeDasharray="3 3" />

      <Tooltip content={CustomTooltip} />
    </ComposedChart>)
  }
  else {
    return (<ComposedChart data={for_lambda} width={500} height={200}>
      <CartesianGrid stroke="#ccc" />


      {lineages.map((value, index) => {

        return <Area  isAnimationActive={false}  type="monotone" name="_range" dataKey={value + "_range"} fill={colors[index]} strokeWidth={0} />
      })}
      {lineages.map((value, index) => {

        return <Line isAnimationActive={false} dot={false} name={value} type="monotone" dataKey={value} stroke={colors[index]} />
      })}


      <XAxis dataKey="date" />
      <YAxis />
      <ReferenceLine x={date} stroke="#aaa" label="" strokeWidth={1} strokeDasharray="3 3" />

      <Tooltip content={CustomTooltip} />
    </ComposedChart>)

  }
}



export default MultiLinePlot;