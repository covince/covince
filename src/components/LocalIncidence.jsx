import React from "react";

import LineChart2 from "./LineChart2";

import moment from "moment";
function LocalIncidence({ data, lad, date, name }) {

  const lad_data = data.filter((item) => item.location == lad)
  return (<div>
    <h2>Local incidences</h2>
    <p className="lead">Local Authority: {name}</p>
    {/* {lad.data && (
              <LineChart
                x={lad.data
                  .filter((item) => item.parameter === "lambda")
                  .map((item) => moment(item.date).format("YYYY-MM-DD"))}
                y={lad.data
                  .filter((item) => item.parameter === "lambda")
                  .map((item) => item.mean)}
                upper={lad.data
                  .filter((item) => item.parameter === "lambda")
                  .map((item) => item.upper)}
                lower={lad.data
                  .filter((item) => item.parameter === "lambda")
                  .map((item) => item.lower)}
              />
            )} */}

    <LineChart2
      date={date}
      x={lad_data
        .filter((item) => item.parameter === "yhat")
        .map((item) => moment(item.date).format("YYYY-MM-DD"))}
      y={lad_data
        .filter((item) => item.parameter === "lambda")
        .map((item) => item.mean)}
      upper={lad_data
        .filter((item) => item.parameter === "lambda")
        .map((item) => item.upper)}
      lower={lad_data
        .filter((item) => item.parameter === "lambda")
        .map((item) => item.lower)}
      y1={lad_data
        .filter((item) => item.parameter === "yhat")
        .map((item) => item.mean)}
      upper1={lad_data
        .filter((item) => item.parameter === "yhat")
        .map((item) => item.upper)}
      lower1={lad_data
        .filter((item) => item.parameter === "yhat")
        .map((item) => item.lower)}
    />

  </div>
  );
}


export default LocalIncidence;
