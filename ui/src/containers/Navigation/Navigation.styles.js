import styled, { css } from 'styled-components'

import { Link } from 'react-router-dom'

import { FONT_FAMILY_HEADER, CONTENT_SPACING } from 'Theme'

const NavigationWrapper = styled.div`
    text-align: right;
    z-index: 999;
`

const EmptySpaceCloseNavigation = styled.div`
    position: fixed;
    left: 0;
    top: 0;
    width 100vw;
    height 100vh;
    z-index: 998;
`

const SubNavigationWrapper = styled.div`
    margin: ${CONTENT_SPACING.m} 0;
`

const LinkListItem = styled.li`
    margin: 5px 0;

    &:hover {
        color: ${props => props.theme.secondaryColor};
        /* text-decoration: underline; */
        border-left: 5px solid black;
    }
`

const sharedStyles = props => css`
    text-decoration: none;
    font-family: ${FONT_FAMILY_HEADER};
    font-weight: 100;
    font-size: 18px;
    color: ${props.theme.primaryColor};
    width: 100%;

    &:visited {
        color: ${props.theme.primaryColor};
    }
`

const InternalLink = styled(Link)`
    ${props => sharedStyles(props)};
`

const ExternalLink = styled.a`
    ${props => sharedStyles(props)};
`

const IconWrapper = styled.div`
    display: inline-block;
    padding-left: ${CONTENT_SPACING.m};
    fill: green;
`

export {
    NavigationWrapper,
    SubNavigationWrapper,
    InternalLink,
    ExternalLink,
    LinkListItem,
    IconWrapper,
    EmptySpaceCloseNavigation
}
