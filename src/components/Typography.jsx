import React from 'react'
import classnames from 'classnames'

export const Heading = ({ tag = 'h2', className, ...props }) =>
  React.createElement(tag, {
    className: classnames(className, 'text-heading text-xl font-heading font-bold leading-6 font-heading'),
    ...props
  })

export const DescriptiveHeading = ({ tag = 'p', className, ...props }) =>
  React.createElement(tag, {
    className: classnames(className, 'uppercase font-medium text-subheading text-xs tracking-wide leading-6'),
    ...props
  })
