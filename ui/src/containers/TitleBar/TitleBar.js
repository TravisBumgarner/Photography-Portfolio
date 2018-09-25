import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { Header } from 'Components'

import { TitleBarWrapper, NavigationOpen } from './TitleBar.styles'

class TitleBar extends Component {
    render() {
        const { toggleNavigation } = this.props
        return (
            <TitleBarWrapper>
                <Header size="large">
                    Travis
                    <br />
                    Bumgarner
                    <br />
                    Photography
                    <br />
                </Header>
                <NavigationOpen onClick={toggleNavigation} size="2.6em" />
            </TitleBarWrapper>
        )
    }
}

TitleBar.propTypes = {}

export default TitleBar
