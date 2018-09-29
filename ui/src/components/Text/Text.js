import React, { Component } from 'react'
import propTypes from 'prop-types'

import { LargeText, MediumText, SmallText } from './Text.styles.js'

class Text extends Component {
    render() {
        const { size, children, inverted } = this.props

        switch (size) {
            case 'large':
                return <LargeText inverted={inverted}>{children}</LargeText>
            case 'medium':
                return <MediumText inverted={inverted}>{children}</MediumText>
            case 'small':
                return <SmallText inverted={inverted}>{children}</SmallText>
            default:
                return <SmallText inverted={inverted}>{children}</SmallText>
        }
    }
}

Text.propTypes = {
    size: propTypes.string,
    children: propTypes.any.isRequired
}

export default Text
