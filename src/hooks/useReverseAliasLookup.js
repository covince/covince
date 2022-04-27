import { useMemo } from 'react'
import { getAliases, getReverseAliasLookup } from '../pango'

export default () => useMemo(() => getReverseAliasLookup(), [getAliases()])
