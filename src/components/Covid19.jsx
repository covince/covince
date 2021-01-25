import React, { useState, useEffect } from "react";
import Spinner from "./Spinner";
import Chloropleth from "./Chloropleth";
import LocalIncidence from "./LocalIncidence";

import Slider from "rc-slider";


import "rc-slider/assets/index.css";

import { loadTiles, getLALookupTable } from "../utils/loadTiles";
import { loadData } from "../utils/loadData";

const Covid19 = () => {
  const [data, indexed_by_date, unique_dates, min_val, max_val] = loadData();
  const LALookupTable = getLALookupTable()
  const [tiles, setTiles] = useState([]);
  const [lad, setLad] = useState({
    lad: "E08000006",
    data: null,
    scale: null,
  });
  const [date, setDate] = useState({
    date: "2020-09-01",

  });

  const handleOnClick = (e, lad) => {
    setLad({ ...lad, lad, data: null });
  };

  const handleDateSlider = (e) => {
    const set_to = unique_dates[e];
    //console.log("date set to ", set_to)
    setDate({ date: set_to });


  };



  useEffect(() => {
    if (tiles.length === 0) setTiles(loadTiles());

  }, [lad, date,tiles]);

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
                indexed_by_date={indexed_by_date}
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

              <LocalIncidence name={LALookupTable[lad.lad]} date={date.date} lad={lad.lad} data={data} />

            </div>
          </div>
        )}
    </React.Fragment>
  );
};

export default Covid19;
