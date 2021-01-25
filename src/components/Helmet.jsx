import React from 'react'
import { Helmet } from 'react-helmet'

const TITLE = 'CovInce'

class HelmetComponent extends React.PureComponent {
  render () {
    return (
      <>
        <Helmet>
          <title>{ TITLE }</title>
        </Helmet>
        ...
      </>
    )
  }
}

export default HelmetComponent;