import classNames from 'classnames'
import React from 'react'

import Checkbox from './Checkbox'
import { DescriptiveHeading } from './Typography'

const LineageFilter = ({ className, toggleLineage, activeLineages }) => (
  <div className={classNames('flex flex-col', className)}>
    <DescriptiveHeading>Lineages</DescriptiveHeading>
    <form className={classNames('flex-grow flex flex-wrap overflow-y-auto')}>
      {Object.keys(activeLineages)
        .map(lineage => {
          const { active, colour } = activeLineages[lineage]
          return (
            <Checkbox
              className='m-1'
              style={{ color: colour }}
              key={lineage}
              id={`lineage_filter_${lineage}`}
              label={lineage}
              checked={active}
              onChange={() => toggleLineage(lineage)}
            />
          )
        })}
    </form>
  </div>
)

export default LineageFilter
