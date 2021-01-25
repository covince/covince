import { features } from "../assets/Local_Authority_Districts__December_2019__Boundaries_UK_BGC.json" // Can change to BUC to reduce bundle size
let colormap = require('colormap')

function getColorScale(dmin,dmax) {
    console.log("GCS")

    let nshades = 400;

    let colors = colormap({
    colormap: 'magma',
    nshades: nshades,
    format: 'hex',
    alpha: 1
    }).reverse()

    let scale = function(number){

        console.log("scale",)
        return(colors[Math.round(nshades*(number-dmin)/(dmax-dmin))])
        
    }
    return scale
}



function loadTiles() {
    return features
}


function getLALookupTable() {
    let lookup_table = {};
    
    features.map((item)=>{
   
        lookup_table[item.properties.lad19cd] = item.properties.lad19nm
    })
    return(lookup_table)
}


export { loadTiles, getColorScale, getLALookupTable}
