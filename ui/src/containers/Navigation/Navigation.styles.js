import styled, { css } from 'styled-components'

import { Link } from 'react-router-dom'

import { FONT_FAMILY_HEADER, CONTENT_SPACING, TEXT_FONT_SIZES } from 'Theme'

const NavigationWrapper = styled.div`
    text-align: right;
    z-index: 999;
    padding: ${CONTENT_SPACING.l};
    border-left: 5px solid black;
    height: 100vh;
    background-color: white;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    width: 300px;
`

const SubNavigationWrapper = styled.div`
    margin: ${CONTENT_SPACING.m} 0;
`

const LinkListItem = styled.li`
    margin: ${CONTENT_SPACING.s} 0;

    &:hover {
        color: ${props => props.theme.secondaryColor};
        border-left: 5px solid rgb(74, 207, 160);
    }
`

const sharedStyles = props => css`
    text-decoration: none;
    font-family: ${FONT_FAMILY_HEADER};
    font-weight: 100;
    font-size: ${TEXT_FONT_SIZES.m};
    color: black;
    width: 100%;

    &:visited {
        color: black;
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
`

export { NavigationWrapper, SubNavigationWrapper, InternalLink, ExternalLink, LinkListItem, IconWrapper }
