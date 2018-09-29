import React from 'react'
import styled from 'styled-components'
import { FaBars } from 'react-icons/fa'
import { Link } from 'react-router-dom'

import { CONTENT_SPACING, TRANSITION_SPEED } from 'Theme'

const TitleBarWrapper = styled.div`
    width: 100vw;
    box-sizing: border-box;
    padding: 0 ${CONTENT_SPACING.m};
    display: flex;
    justify-content: space-between;
    position: fixed;
    top: 0;
    left: 0;
    background-color: white;
`

const InternalLink = styled(Link)`
    text-decoration: none;

    &:visited {
        color: black;
    }
`

const NavigationOpen = styled(({ isNavigationVisible, ...rest }) => <FaBars {...rest} />)`
    fill: #ccc;
    padding-bottom: 1vw;
    padding-top: 2vw;
    transition: opacity ${TRANSITION_SPEED}s;
    opacity: ${props => (props.isNavigationVisible ? 0 : 1)};

    &:hover {
        fill: #000;
    }
`

export { TitleBarWrapper, NavigationOpen, InternalLink }
