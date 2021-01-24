import React, { useState } from "react";
import { Line } from "react-chartjs-2";

const LineChart = ({ x, y, upper, lower }) => {
  const state = {
    labels: x,
    datasets: [
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
        backgroundColor: "rgb(235, 122, 52, 0.2)",
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
        backgroundColor: "rgb(235, 122, 52, 0.2)",
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
  return (
    <Line
      data={state}
      options={{
        title: {
          display: true,
          text: "Daily incidence",
          fontSize: 14,
          maintainAspectRatio: false,
        },
        legend: {
          display: true,
          position: "bottom",
        },
      }}
    />
  );
};

export default LineChart;
