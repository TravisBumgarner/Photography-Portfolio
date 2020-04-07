import React from 'react'
import styled from 'styled-components'
import { FaBars } from 'react-icons/fa'
import { Link } from 'react-router-dom'

import { Header } from 'sharedComponents'
import { CONTENT_SPACING, ICON_FONT_SIZES, TRANSITION_SPEED, ICON_COLOR } from 'Theme'

const SuperWrapper = styled.div`
    z-index: 900;
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
`

const TitleBarWrapper = styled.div`
    max-width: 1200px;
    margin: 0 auto;
    box-sizing: border-box;
    padding: 0 ${CONTENT_SPACING.l};
    display: flex;
    justify-content: space-between;
    background-color: rgba(255, 255, 255, 1);
`

const InternalLink = styled(Link)`
    text-decoration: none;
    color: black;

    &:visited {
        color: black;
    }
`

const NavigationOpen = styled(({ isNavigationVisible, ...rest }) => <FaBars {...rest} />)`
    fill: ${ICON_COLOR.initial};
    padding-bottom: ${CONTENT_SPACING.l};
    padding-top: ${CONTENT_SPACING.l};
    transition: opacity ${TRANSITION_SPEED}s;
    opacity: ${props => (props.isNavigationVisible ? 0 : 1)};

    &:hover {
        fill: ${ICON_COLOR.hover};
    }
`

type Props = {
    toggleNavigation: () => void
    isNavigationVisible: boolean
}

const TitleBar = ({ toggleNavigation, isNavigationVisible }: Props) => {
    return (
        <SuperWrapper>
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
        </SuperWrapper>
    )
}

export default TitleBar
