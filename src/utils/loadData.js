import { data } from "../assets/data_full.json"



const dataForge = require('data-forge');



function loadData() {
  let new_data = data.map(x => {
    x.range = [x.lower,x.upper];
    return(x)
  } )
  const dataframe = new dataForge.DataFrame(new_data)//.parseFloats("mean", "lower", "upper")
  return (dataframe);
}


export { loadData }