import React, { Component } from 'react'
import propTypes from 'prop-types'

import { LargeHeader, MediumHeader, SmallHeader, InlineHeader } from './Header.styles.js'

class Header extends Component {
    render() {
        const { size, children } = this.props

        switch (size) {
            case 'large':
                return <LargeHeader>{children}</LargeHeader>
            case 'medium':
                return <MediumHeader>{children}</MediumHeader>
            case 'small':
                return <SmallHeader>{children}</SmallHeader>
            case 'inline':
                return <InlineHeader>{children}</InlineHeader>
            default:
                return <SmallHeader>{children}</SmallHeader>
        }
    }
}

Header.propTypes = {
    size: propTypes.string,
    children: propTypes.any.isRequired
}

export default Header
