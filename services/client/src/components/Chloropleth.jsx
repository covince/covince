import React, { useEffect, useState } from "react";
import { MapContainer, GeoJSON } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import chroma from "chroma-js";
import "./Chloropleth.css";
import { loadTiles, colorTile } from "../utils/loadTiles";
import { kMaxLength } from "buffer";


class Chloropleth extends React.Component {
  shouldComponentUpdate(nextProps, nextState) {
    console.log("yippee")
    // TODO: return false and manually update map for updates
    return true;
}

render(){
  const { tiles, data, scale, handleOnClick } = this.props;
  console.log("woo")
  const mapStyle = {
    fillColor: "white",
    weight: 1,
    color: "black",
    fillOpacity: 1,
  };

  const createColorBar = (data, scale) => {
    const meanArray = data.map((item) => item.mean);
    const dmin = Math.min(...meanArray);
    const dmax = Math.max(...meanArray);
    // const scale = chroma.scale("OrRd").domain([dmin, dmax]);

    const items = [];
    for (let i = 0; i <= 100; i++) {
      items.push(
        <span
          key={`${i}`}
          className="grad-step"
          style={{ backgroundColor: scale(dmin + (i / 100) * (dmax - dmin)) }}
        ></span>
      );
    }
    items.push(
      <span key="domain-min" className="domain-min">
        {Math.ceil(dmin)}
      </span>
    );
    items.push(
      <span key="domain-med" className="domain-med">
        {Math.ceil((dmin + dmax) * 0.5)}
      </span>
    );
    items.push(
      <span key="domain-max" className="domain-max">
        {Math.ceil(dmax)}
      </span>
    );

    return <div>{items}</div>;
  };

  const colorScale = async (data, item) => {
    const meanArray = data.map((item) => item.mean);
    const scale = chroma
      .scale("OrRd")
      .domain([Math.min(...meanArray), Math.max(...meanArray)]);
    return scale(item.mean).hex();
  };

  const onEachLad = async (lad, layer) => {
    const name = lad.properties.lad18nm;
    const code = lad.properties.lad18cd;
    const item = data.find((item) => item.location === code);
    // layer.options.fillColor =
    //   typeof item !== "undefined" ? await colorScale(data, item) : "#ffffff";
    layer.options.fillColor =
      typeof item !== "undefined" ? scale(item.mean) : "#ffffff";
    layer.bindPopup(`${name} (${code})`);
    layer.on({
      click: (e) => handleOnClick(e, code),
    });
  };

  return (
    <div>
      <MapContainer style={{ height: "60vh" }} zoom={6} center={[55.5, -3]}>
        {data && (
          <GeoJSON style={mapStyle} data={tiles} onEachFeature={onEachLad} />
        )}
      </MapContainer>
      <div className="gradient">
        <center>{data && createColorBar(data, scale)}</center>
      </div>
    </div>
  );

        }
};

export default Chloropleth;
