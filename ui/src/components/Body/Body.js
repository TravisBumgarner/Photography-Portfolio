import React, { Component } from 'react'
import propTypes from 'prop-types'

import { LargeBody, MediumBody, SmallBody } from './Body.styles.js'

class Body extends Component {
    render() {
        const { size, children } = this.props

        switch (size) {
            case 'large':
                return <LargeBody>{children}</LargeBody>
            case 'medium':
                return <MediumBody>{children}</MediumBody>
            case 'small':
                return <SmallBody>{children}</SmallBody>
            default:
                return <SmallBody>{children}</SmallBody>
        }
    }
}

Body.propTypes = {
    size: propTypes.string,
    children: propTypes.string.isRequired
}

export default Body
