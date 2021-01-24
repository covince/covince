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


function getLALookupTable() {
    let lookup_table = {};
    
    features.map((item)=>{
   
        lookup_table[item.properties.lad18cd] = item.properties.lad18nm
    })
    return(lookup_table)
}


export {colorTile, loadTiles, getColorScale, getLALookupTable}
