import { ltlas, lineages } from '../assets/lists.json'

// import dataForge from 'data-forge'
// const dataForge = require('data-forge');

function loadData () {
  return { ltlas: ltlas, lineages: lineages }
}

export { loadData }
