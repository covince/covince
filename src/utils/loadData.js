import { data } from "../assets/data_full.json"

const dataForge = require('data-forge');



function loadData() {

  const dataframe = new dataForge.DataFrame(data)//.parseFloats("mean", "lower", "upper")
  return (dataframe);
}


export { loadData }