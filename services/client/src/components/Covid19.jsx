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
import { loadTiles, getColorScale } from "../utils/loadTiles";

const Covid19 = () => {
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
    setDate({
      ...date,
      date: moment(date.range[e]).format("YYYY-MM-DD"),
      data: null,
    });
  };

  const requestLad = async (lad) => {
    //console.log(lad);
    const { data } = await axios.get(
      `${process.env.REACT_APP_SERVICE_URL}/data/location/${lad.lad}`
    );

    setLad({ ...lad, data });
    const range = data.map((item) => item.date);
    setDate({ ...date, range });
  };

  const requestDate = async (date) => {
    const { data } = await axios.get(
      `${process.env.REACT_APP_SERVICE_URL}/data/date/${date.date}`
    );
    console.log(data);
    const scale = getColorScale(
      data.filter((item) => item.parameter === "lambda")
    );
    setDate({ ...date, data, scale });
  };

  useEffect(() => {
    if (tiles.length === 0) setTiles(loadTiles());
    if (lad.data === null) requestLad(lad);
    if (date.data === null) requestDate(date);
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
              data={
                date.data &&
                date.data.filter((item) => item.parameter === "lambda")
              }
              scale={date.scale}
              handleOnClick={handleOnClick}
            />
          </div>
          <div className="col-md-6">
            <h2>Select date</h2>
            <p className="lead">Current date: {date.date}</p>
            <Slider
              min={0}
              max={date.range && date.range.length}
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
