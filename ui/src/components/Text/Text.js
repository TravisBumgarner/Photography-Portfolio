import React, { Component } from 'react'

import { LargeText, MediumText, SmallText } from './Text.styles.js'

class Text extends Component {
    render() {
        const { size, children, inverted } = this.props

        switch (size) {
            default:
                return <MediumText inverted={inverted}>{children}</MediumText>
        }
    }
}

export default Text
