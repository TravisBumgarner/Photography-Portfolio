import React, { Component } from 'react'
import propTypes from 'prop-types'

import { LargeText, MediumText, SmallText } from './Text.styles.js'

class Text extends Component {
    render() {
        const { size, children } = this.props

        switch (size) {
            case 'large':
                return <LargeText>{children}</LargeText>
            case 'medium':
                return <MediumText>{children}</MediumText>
            case 'small':
                return <SmallText>{children}</SmallText>
            default:
                return <SmallText>{children}</SmallText>
        }
    }
}

Text.propTypes = {
    size: propTypes.string,
    children: propTypes.string.isRequired
}

export default Text
