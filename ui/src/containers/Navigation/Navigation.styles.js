import styled from 'styled-components'

import { Link } from 'react-router-dom'

import { FONT_FAMILY_HEADER, CONTENT_SPACING } from 'Theme'

const NavigationWrapper = styled.div`
    text-align: right;
padding-right: ${CONTENT_SPACING * 2}vw;
`

const SubNavigationWrapper = styled.div`
    margin: ${CONTENT_SPACING}vw 0;
`

const LinkListItem = styled.li`
    margin: 5px 0;
`

const InternalLink = styled(Link)`
    text-decoration: none;
    font-family: ${FONT_FAMILY_HEADER};
    font-weight: 100;
    font-size: 18px;
    color: ${props => props.theme.primaryColor};

    &:visited {
        color: ${props => props.theme.primaryColor};
    }

    &:hover {
        color: ${props => props.theme.secondaryColor};
    }
`

const ExternalLink = styled.a`
    text-decoration: none;
    color: ${props => props.theme.primaryColor};
    font-family: ${FONT_FAMILY_HEADER};
    font-weight: 100;
    font-size: 18px;

    &:visited {
        color: ${props => props.theme.primaryColor};
    }

    &:hover {
        color: ${props => props.theme.secondaryColor};
    }
`

export { NavigationWrapper, SubNavigationWrapper, InternalLink, ExternalLink, LinkListItem }
