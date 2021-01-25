import React from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "./Chloropleth.css";
import {  getColorScale } from "../utils/loadTiles";




const MapUpdater = ({ date, indexed_by_date, data, scale, map_loaded }) => {
  console.log("updating")
  const map = useMap()

  window.map = map
  for (var i in map._layers) {

    const layer = map._layers[i]
    if (layer.setStyle && layer.feature) {

      const item = indexed_by_date[date][layer.feature.properties.lad19cd];

      const fillColor =
        typeof item !== "undefined" ? scale(item.mean) : "#ffffff";
      layer.setStyle({ 'fillColor': fillColor })
    }
  }
  return (
    <div >{date}</div>
  )
}



class Chloropleth extends React.Component {

  state = {
    map_loaded: false
  }


  shouldComponentUpdate(nextProps, nextState) {

    // TODO: return false and manually update map for updates
    return true;
  }

  whenReady = () => {
    this.setState({ map_loaded: true });
    console.log("mount")
  }


  render() {
    const { tiles, data, indexed_by_date, date, handleOnClick, min_val, max_val } = this.props;




    const scale = getColorScale(min_val, max_val)

    const mapStyle = {
      fillColor: "white",
      weight: 0.5,
      color: "#333333",
      fillOpacity: 1,
    };

    const createColorBar = (dmin, dmax, scale) => {

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



    const onEachLad = async (lad, layer) => {
      const name = lad.properties.lad19nm;
      const code = lad.properties.lad19cd;

      // layer.options.fillColor =
      //   typeof item !== "undefined" ? await colorScale(data, item) : "#ffffff";

      layer.bindPopup(`${name} (${code})`);
      layer.on({
        click: (e) => handleOnClick(e, code),
      });
    };

    return (
      <div>
        <MapContainer style={{ height: "60vh" }} zoom={6} center={[55.5, -3]}>

          <GeoJSON style={mapStyle} data={tiles} onEachFeature={onEachLad} eventHandlers={{
            add: this.whenReady
          }} />
          <MapUpdater date={date} indexed_by_date={indexed_by_date} data={data} scale={scale} map_loaded={this.state.map_loaded} />
        </MapContainer>
        <div className="gradient">
          <center> {createColorBar(min_val, max_val, scale)}</center>
        </div>
      </div>
    );

  }
};

export default Chloropleth;
