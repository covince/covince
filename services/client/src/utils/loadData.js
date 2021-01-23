import papa from "papaparse"
import data from '../data/data.csv';


function loadData() {
    //console.log(data)
    let matchedData = null

    papa.parse(data, {
        download: true,
        header: true,
        complete: (result) => {
            console.log(result.data)
            matchedData = result.data
        }
    })
    // const matchedData = this.lads.map(item => {
    //     const matchingLad = data.find(lad => lad.lad19cd === item.properties.lad18cd)
    //     //console.log(matchingLad)
    //     item.properties = {...item.properties, ...matchingLad}
    //     return item
    // })
    console.log(matchedData)

    // setState(matchedData);  
}

export default loadData