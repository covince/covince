import { features } from "../assets/Local_Authority_Districts__December_2019__Boundaries_UK_BUC.json" // Can change to BUC to reduce bundle size
let colormap = require('colormap')

function getColorScale(dmin,dmax) {
    dmin=.1
    dmax = 200

    console.log("GCS")

    let nshades = 4000 ;

    let colors = colormap({
    colormap: 'magma',
    nshades: nshades,
    format: 'hex',
    alpha: 1
    }).reverse()

    let scale = function(number){

        if(number>dmax){ number=dmax-1}

        const max_log = Math.sqrt(dmax)
        const min_log = Math.sqrt(dmin)
        const num_log = Math.sqrt(number)



        

        console.log("scale",)
        let portion_of_scale_to_use = 0.9; // don't go to deep black
        return(colors[Math.round(portion_of_scale_to_use*nshades*(num_log-min_log)/(max_log-min_log))])
        
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
