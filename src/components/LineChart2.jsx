import React, { useState } from "react";


import { Line } from "react-chartjs-2";

import Chart from 'chart.js';
import * as ChartAnnotation from 'chartjs-plugin-annotation';

import moment from "moment";



const LineChart2 = ({ x, y, upper, lower, y1, upper1, lower1, date,lad }) => {

  const key = date+lad;
  const state = {
    labels: x,
    datasets: [
      {
        label: "Predicted incidence",
        fill: false,
        lineTension: 0.5,
        backgroundColor: "rgba(236, 236, 236, 1)",
        borderColor: "#rgba(236, 236, 236, 1)",
        borderWidth: 0,
        data: upper,
        pointRadius: 0,
      },
      {
        // label: "BandTop",
        type: "line",
        backgroundColor: "rgba(236, 236, 236, .4)",
        borderColor: "transparent",
        pointRadius: 0,
        fill: 0,
        tension: 0,
        data: upper1,
        // yAxisID: "y",
        // xAxisID: "x",
      },
      {
        // label: "BandBottom",
        type: "line",
        backgroundColor: "rgba(236, 236, 236, .4)",
        borderColor: "transparent",
        pointRadius: 0,
        fill: 0,
        tension: 0,
        data: lower,
        // yAxisID: "y",
        // xAxisID: "x",
      },

      {
        label: "Predicted incidence",
        fill: false,
        lineTension: 0.5,
        backgroundColor: "rgba(236, 236, 236, 1)",
        borderColor: "#rgba(236, 236, 236, 1)",
        borderWidth: 0,
        data: lower,
        pointRadius: 0,
      },
      {
        // label: "BandTop",
        type: "line",
        backgroundColor: "rgba(236, 236, 236, .4)",
        borderColor: "transparent",
        pointRadius: 0,
        fill: 0,
        tension: 0,
        data: lower1,
        // yAxisID: "y",
        // xAxisID: "x",
      },
      {
        // label: "BandBottom",
        type: "line",
        backgroundColor: "rgba(236, 236, 236, .4)",
        borderColor: "transparent",
        pointRadius: 0,
        fill: 0,
        tension: 0,
        data: upper,
        // yAxisID: "y",
        // xAxisID: "x",
      },

      {
        label: "Predicted incidence",
        fill: false,
        lineTension: 0.5,
        backgroundColor: "rgb(235, 122, 52, 1)",
        borderColor: "#ffa500",
        borderWidth: 3,
        data: y,
        pointRadius: 0,
      },
      {
        // label: "BandTop",
        type: "line",
        backgroundColor: "rgb(235, 122, 52, 0.5)",
        borderColor: "transparent",
        pointRadius: 0,
        fill: 0,
        tension: 0,
        data: upper,
        // yAxisID: "y",
        // xAxisID: "x",
      },
      {
        // label: "BandBottom",
        type: "line",
        backgroundColor: "rgb(235, 122, 52, 0.5)",
        borderColor: "transparent",
        pointRadius: 0,
        fill: 0,
        tension: 0,
        data: lower,
        // yAxisID: "y",
        // xAxisID: "x",
      },
    ],
  };

  console.log(date)

  const options = {
    animation: {
      duration: 0
    },
    title: {
      display: true,
      text: "Daily incidence",
      fontSize: 14,
      maintainAspectRatio: false,
    },
    annotation: {
      annotations: [
        {
          drawTime: "afterDatasetsDraw",
          id: "hline",
          type: "line",
          mode: "vertical",
          scaleID: "x-axis-0",
          value: date,
          borderColor: "black",
          borderWidth: 1,
          /*label: {
            backgroundColor: "gray",
            content: date,
            enabled: true
          }*/
        }
      ]
    }


    ,
    legend: {
      display: false,
      position: "bottom",
    },
  }
  console.log(options)



  return (
    <Line plugins={[ChartAnnotation]}
      data={state}
      options={options}
      key={key}
    />
  );
};

export default LineChart2;
