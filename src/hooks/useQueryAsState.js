// https://github.com/baruchiro/use-route-as-state

import { useCallback, useMemo } from 'react'
import { useHistory, useLocation } from 'react-router-dom'

const queryParamsToObject = (search) => {
  const params = {}
  new URLSearchParams(search).forEach((value, key) => { params[key] = value })
  return params
}

const objectToQueryParams = (obj) =>
  '?' + Object.keys(obj)
    .filter((key) => obj[key] !== undefined)
    .map((key) => `${key}=${obj[key]}`)
    .join('&')

const encodeValues = obj => {
  const nextObj = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      nextObj[key] = encodeURIComponent(value)
    }
  }
  return nextObj
}

const removeUndefined = (obj) => {
  const nextObj = {}
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      nextObj[key] = value
    }
  }
  return nextObj
}

export default (defaultValues) => {
  const history = useHistory()
  const { pathname, search } = useLocation()

  const decodedSearch = useMemo(() => queryParamsToObject(search), [search])

  const updateQuery = useCallback((updatedParams) => {
    history.push(pathname + objectToQueryParams(encodeValues({ ...decodedSearch, ...updatedParams })))
  }, [decodedSearch, pathname, history])

  const queryWithDefault = useMemo(() =>
    Object.assign({}, defaultValues, removeUndefined(decodedSearch))
  , [decodedSearch, defaultValues])

  return [queryWithDefault, updateQuery]
}
