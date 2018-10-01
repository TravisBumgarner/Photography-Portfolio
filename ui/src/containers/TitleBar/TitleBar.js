import React, { Component } from 'react'

import { ICON_FONT_SIZES } from 'Theme'

import { TitleBarWrapper, NavigationOpen, InternalLink, StyledHeader } from './TitleBar.styles'

class TitleBar extends Component {
    render() {
        const { toggleNavigation, isNavigationVisible } = this.props
        return (
            <TitleBarWrapper>
                <InternalLink to="/">
                    <StyledHeader size="large">Travis Bumgarner Photography</StyledHeader>
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
