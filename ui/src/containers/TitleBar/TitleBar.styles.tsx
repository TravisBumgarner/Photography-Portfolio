import React from 'react'
import styled from 'styled-components'
import { FaBars } from 'react-icons/fa'
import { Link } from 'react-router-dom'

import { Header } from 'Components'
import { CONTENT_SPACING, TRANSITION_SPEED, ICON_COLOR } from 'Theme'

const TitleBarWrapper = styled.div`
    width: 100vw;
    box-sizing: border-box;
    padding: 0 ${CONTENT_SPACING.l};
    display: flex;
    justify-content: space-between;
    z-index: 900;
    position: fixed;
    top: 0;
    left: 0;
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

export { TitleBarWrapper, NavigationOpen, InternalLink }
