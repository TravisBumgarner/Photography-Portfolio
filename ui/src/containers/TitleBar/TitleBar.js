import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Header } from 'Components'

import { TitleBarWrapper, NavigationOpen } from './TitleBar.styles'

class TitleBar extends Component {
    render() {
        const { toggleNavigation } = this.props
        return (
            <TitleBarWrapper>
                <NavigationOpen onClick={toggleNavigation} size="2.6em" />
                <Header size="large">Travis Bumgarner</Header>
            </TitleBarWrapper>
        )
    }
}

TitleBar.propTypes = {}

export default TitleBar
