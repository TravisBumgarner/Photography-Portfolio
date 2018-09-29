import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Header } from 'Components'

import { TitleBarWrapper, NavigationOpen } from './TitleBar.styles'

class TitleBar extends Component {
    render() {
        const { toggleNavigation, isNavigationVisible } = this.props
        return (
            <TitleBarWrapper>
                <Header size="large">Travis Bumgarner Photography</Header>
                <NavigationOpen isNavigationVisible={isNavigationVisible} onClick={toggleNavigation} size="2.6em" />
            </TitleBarWrapper>
        )
    }
}

TitleBar.propTypes = {
    isNavigationVisible: PropTypes.bool.isRequired,
    toggleNavigation: PropTypes.func.isRequired
}

export default TitleBar
