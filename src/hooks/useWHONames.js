import useQueryAsState from './useQueryAsState'

export const pangoToWHO = {
  'B.1.1.7': {
    name: 'Alpha',
    character: 'α',
    sort: 1
  },
  'B.1.351': {
    name: 'Beta',
    character: 'β',
    sort: 2
  },
  'P.1': {
    name: 'Gamma',
    character: 'γ',
    sort: 3
  },
  'B.1.617.2': {
    name: 'Delta',
    character: 'δ',
    sort: 4

  },
  'B.1.525': {
    name: 'Eta',
    character: 'η',
    sort: 5
  }
}

export const useRoulette = () => {
  const [{ roulette }, updateQuery] = useQueryAsState({ roulette: 'pango-who' })
  return {
    roulette,
    setRoulette: roulette => updateQuery({ roulette })
  }
}

export default () => {
  return (pango) => pangoToWHO[pango]
}
