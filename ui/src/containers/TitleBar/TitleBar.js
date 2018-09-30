import React, { Component } from 'react'

import { Header } from 'Components'
import { ICON_FONT_SIZES } from 'Theme'

import { TitleBarWrapper, NavigationOpen, InternalLink } from './TitleBar.styles'

class TitleBar extends Component {
    render() {
        const { toggleNavigation, isNavigationVisible } = this.props
        return (
            <TitleBarWrapper>
                <InternalLink to="/">
                    <Header size="large">Travis Bumgarner Photography</Header>
                </InternalLink>
                <NavigationOpen
                    isNavigationVisible={isNavigationVisible}
                    onClick={toggleNavigation}
                    size={ICON_FONT_SIZES.l}
                />
            </TitleBarWrapper>
        )
    }
}

export default TitleBar
