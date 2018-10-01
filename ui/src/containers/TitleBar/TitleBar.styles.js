import React from 'react'
import styled from 'styled-components'
import { FaBars } from 'react-icons/fa'
import { Link } from 'react-router-dom'

import { Header } from 'Components'
import { CONTENT_SPACING, TRANSITION_SPEED } from 'Theme'

const TitleBarWrapper = styled.div`
    width: 100vw;
    box-sizing: border-box;
    padding: 0 ${CONTENT_SPACING.l};
    display: flex;
    justify-content: space-between;
    background-color: white;
`

const StyledHeader = styled(Header)`
    border-left: 5px solid rgb(74, 207, 160);
    padding-left: ${CONTENT_SPACING.l};
`

const InternalLink = styled(Link)`
    text-decoration: none;

    &:visited {
        color: black;
    }
`

const NavigationOpen = styled(({ isNavigationVisible, ...rest }) => <FaBars {...rest} />)`
    fill: #ccc;
    padding-bottom: ${CONTENT_SPACING.l};
    padding-top: ${CONTENT_SPACING.l};
    transition: opacity ${TRANSITION_SPEED}s;
    opacity: ${props => (props.isNavigationVisible ? 0 : 1)};

    &:hover {
        fill: rgb(74, 207, 160);
    }
`

export { TitleBarWrapper, NavigationOpen, InternalLink, StyledHeader }
