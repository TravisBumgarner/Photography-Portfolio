import styled, { css } from 'styled-components'

import { Link } from 'react-router-dom'

import { FONT_FAMILY_HEADER, CONTENT_SPACING, TEXT_FONT_SIZES } from 'Theme'

const NavigationWrapper = styled.div`
    text-align: right;
    z-index: 999;
    padding: ${CONTENT_SPACING.l};
    border-left: 5px solid black;
    height: 100vh;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    width: 300px;
    background-color: rgba(255, 255, 255, 1);
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

const sharedStyles = css`
    text-decoration: none;
    font-family: ${FONT_FAMILY_HEADER};
    font-weight: 100;
    font-size: ${TEXT_FONT_SIZES.m};
    color: black;
    width: 100%;
    display: inline-block;

    &:visited {
        color: black;
    }
`

const InternalLink = styled(Link)`
    ${sharedStyles}
`

const ExternalLink = styled.a`
    ${sharedStyles}
`

export { NavigationWrapper, SubNavigationWrapper, InternalLink, ExternalLink, LinkListItem }
