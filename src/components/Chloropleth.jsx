import React from "react";
import { MapContainer, GeoJSON, useMap } from "react-leaflet";

import "leaflet/dist/leaflet.css";
import "./Chloropleth.css";
import { getColorScale } from "../utils/loadTiles";




const MapUpdater = ({ date, indexed_by_date, dataframe, scale, map_loaded }) => {


  const map = useMap()

  window.map = map
  window.scale = scale

  return (false)
}



class Chloropleth extends React.Component {

  state = {
    map_loaded: false
  }


  shouldComponentUpdate(nextProps, nextState) {
  const {dataframe,date} =nextProps
  const by_loc = dataframe[date].getSeries('mean')
  window.by_loc = by_loc
  console.log("updating")
  const map = window.map
  const scale = window.scale
  for (var i in map._layers) {

    const layer = map._layers[i]
    if (layer.setStyle && layer.feature) {
      let fillColor = null
      
        const item = by_loc.getRowByIndex(layer.feature.properties.lad19cd);
        //console.log(layer.feature.properties.lad19cd,item)

        fillColor = typeof item !== "undefined" ? scale(item) : "#ffffff";
      
      layer.setStyle({ 'fillColor': fillColor })
    }


  }

    // TODO: return false and manually update map for updates
    return false;
  }

  whenReady = () => {
    this.setState({ map_loaded: true });
    console.log("mount")
  }


  render() {
    const { tiles, dataframe, indexed_by_date, date, handleOnClick, min_val, max_val, lineage } = this.props;


    

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
      console.log('each')
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
        <MapContainer style={{ height: "60vh" }} zoom={5.5} center={[53.5, -3]}>

          <GeoJSON style={mapStyle} data={tiles} onEachFeature={onEachLad} eventHandlers={{
            add: this.whenReady
          }} />
          <MapUpdater date={date} indexed_by_date={indexed_by_date} dataframe={dataframe} scale={scale} map_loaded={this.state.map_loaded} />
        </MapContainer>
        <div className="gradient">
          <center> {createColorBar(min_val, max_val, scale)}</center>
        </div>
      </div>
    );

  }
};

export default Chloropleth;
