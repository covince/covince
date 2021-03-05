import LegendItem from './LegendItem'

const legendItems = [
  new LegendItem('> 50', '#741f1f', (cases) => cases >= 50, 'white'),
  new LegendItem(
    '40 - 50',
    '#741f1f',
    (cases) => cases >= 40 && cases <= 50,
    'white'
  ),
  new LegendItem(
    '30 - 40',
    '#9c2929',
    (cases) => cases >= 30 && cases <= 40,
    'white'
  ),
  new LegendItem(
    '20 - 30',
    '#741f1f',
    (cases) => cases >= 20 && cases <= 30,
    'white'
  ),
  new LegendItem(
    '10 - 20',
    '#c57f7f',
    (cases) => cases >= 10 && cases <= 20,
    'white'
  ),
  new LegendItem(
    '0 - 10',
    '#d8aaaa',
    (cases) => cases >= 0 && cases <= 10,
    'white'
  ),
  new LegendItem('NA', '#ffffff', (cases) => true, 'white')
]

export default legendItems
