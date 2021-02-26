import { ltlas,lineages } from "../assets/lists.json"



const dataForge = require('data-forge');



function loadData() {
  return{'ltlas':ltlas, 'lineages':lineages}
}


export { loadData }