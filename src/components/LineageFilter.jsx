import classNames from 'classnames'
import React from 'react'

import Checkbox from './Checkbox'
import { DescriptiveHeading } from './Typography'

const LineageFilter = ({ className, toggleLineage, activeLineages }) => (
  <div className={classNames('flex flex-col', className)}>
    <DescriptiveHeading>Lineages</DescriptiveHeading>
    <form className={classNames('flex-grow flex flex-wrap content-center overflow-y-auto -mx-4 md:-mx-2')}>
      {Object.keys(activeLineages)
        // .slice(0, 3)
        .map(lineage => {
          const { active, colour } = activeLineages[lineage]
          return (
            <Checkbox
              className='mx-4 md:mx-2 h-8 md:h-7'
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
