import { ltlas, lineages, default_date } from '../../public/data/lists.json'

// import dataForge from 'data-forge'
// const dataForge = require('data-forge');

function loadData () {
  return { ltlas: ltlas, lineages: lineages, initialDate: default_date }
}

export { loadData }
