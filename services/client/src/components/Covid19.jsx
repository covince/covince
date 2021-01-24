import React, { useState, useEffect } from "react";
import Spinner from "./Spinner";
import Chloropleth from "./Chloropleth";

import Slider from "rc-slider";
import LineChart from "./LineChart";
import LineChart2 from "./LineChart2";
import axios from "axios";
import moment from "moment";
import "rc-slider/assets/index.css";

import legendItems from "../entities/LegendItems";
import { loadTiles } from "../utils/loadTiles";
import { loadData } from "../utils/loadData";

const Covid19 = () => {
  const [data,indexed_by_date,unique_dates,min_val,max_val] = loadData();

  const [tiles, setTiles] = useState([]);
  const [lad, setLad] = useState({
    lad: "E08000006",
    data: null,
    scale: null,
  });
  const [date, setDate] = useState({
    date: "2020-09-01",
    data: null,
    range: null,
  });

  const handleOnClick = (e, lad) => {
    setLad({ ...lad, lad, data: null });
  };

  const handleDateSlider = (e) => {
    const set_to = unique_dates[e];
   //console.log("date set to ", set_to)
    setDate({date: set_to});
    
    
  };

  const requestLad = async (lad) => {
    //console.log(lad);
  
   // setLad({ ...lad, data });
   // const range = data.map((item) => item.date);
   // setDate({ ...date, range });
  };

  

  useEffect(() => {
    if (tiles.length === 0) setTiles(loadTiles());
    if (lad.data === null) requestLad(lad);
    // if (date.range === null) setDate({ ...date, range: getDates() });vo
    // if ()
  }, [lad, date]);

  return (
    <React.Fragment>
      {tiles && tiles.length === 0 ? (
        <div className="row">
          <Spinner />
        </div>
      ) : (
        <div className="row">
          <div className="col-md-6">
            <h2>Map</h2>
            <Chloropleth
              tiles={tiles}
              max_val={max_val}
              min_val={min_val}
              indexed_by_date = {indexed_by_date}
              date={date.date}
              scale={date.scale}
              handleOnClick={handleOnClick}
            />
          </div>
          <div className="col-md-6">
            <h2>Select date</h2>
            <p className="lead">Current date: {date.date}</p>
            <Slider
              min={0}
              max={unique_dates && unique_dates.length}
              onChange={handleDateSlider}
            />
            <hr />
            <h2>Local incidences</h2>
            <p className="lead">Local Authority: {lad.lad}</p>
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
            {lad.data && (
              <LineChart2
                x={lad.data
                  .filter((item) => item.parameter === "yhat")
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
                y1={lad.data
                  .filter((item) => item.parameter === "yhat")
                  .map((item) => item.mean)}
                upper1={lad.data
                  .filter((item) => item.parameter === "yhat")
                  .map((item) => item.upper)}
                lower1={lad.data
                  .filter((item) => item.parameter === "yhat")
                  .map((item) => item.lower)}
              />
            )}
          </div>
        </div>
      )}
    </React.Fragment>
  );
};

export default Covid19;
