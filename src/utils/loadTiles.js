import { features } from "../assets/Local_Authority_Districts__December_2019__Boundaries_UK_BGC.json" // Can change to BUC to reduce bundle size
//import { features } from "../assets/hex.json" // Can change to BUC to reduce bundle size


let colormap = require('colormap')

function getColorScale(dmin, dmax, color_scale_type) {
    //dmin=0
    // dmax = 200

    console.log("GCS")

    let nshades = 4000;

    let colors = colormap({
        colormap: 'magma',
        nshades: nshades,
        format: 'hex',
        alpha: 1
    }).reverse()

    let scale = function (number) {

        if (number > dmax) { number = dmax - 1 }
        let dmax_val,dmin_val, number_val

        if(color_scale_type=="quadratic"){

          dmax_val = Math.sqrt(dmax)
          dmin_val = Math.sqrt(dmin)
          number_val = Math.sqrt(number)

        }
        else{
            dmax_val = dmax
            dmin_val = dmin
            number_val = number
        }





        //console.log("scale",)
        let portion_of_scale_to_use = 0.9; // don't go to deep black
        return (colors[Math.round(portion_of_scale_to_use * nshades * (number_val - dmin_val) / (dmax_val - dmin_val))])

    }
    return scale
}



function loadTiles() {
    return features
}


function getLALookupTable() {
    let lookup_table = {};

    features.forEach((item) => {

        lookup_table[item.properties.lad19cd] = item.properties.lad19nm
    })
    return (lookup_table)
}


export { loadTiles, getColorScale, getLALookupTable }
