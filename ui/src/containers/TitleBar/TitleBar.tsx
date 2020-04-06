import React from 'react'

import { ICON_FONT_SIZES } from 'Theme'
import { Header } from 'sharedComponents'

import { TitleBarWrapper, NavigationOpen, InternalLink } from './TitleBar.styles'

type Props = {
    toggleNavigation: () => void
    isNavigationVisible: boolean
}

const TitleBar = ({ toggleNavigation, isNavigationVisible }: Props) => {
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

export default TitleBar
