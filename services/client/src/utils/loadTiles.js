import { features } from "../assets/unitedKingdom.json"
import chroma from "chroma-js"


function getColorScale(dmin,dmax) {

    //console.log("chroma", dmin, dmax)
    const scale = chroma.scale("OrRd").domain([dmin, dmax]);
    return scale
}

function colorTile(min, max) {
    const scale = chroma.scale(["yellow", "008ae5"]).domain([min, max]);
    return scale
}

function loadTiles() {
    return features
}

export {colorTile, loadTiles, getColorScale}
