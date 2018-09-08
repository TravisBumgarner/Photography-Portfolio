import styled from 'styled-components'

import { Link } from 'react-router-dom'

import { FONT_FAMILY_HEADER } from 'Theme'

const NavigationWrapper = styled.div`
    color: black;
`

const SubNavigationWrapper = styled.div`
    margin: 2vw 0;
`

const LinkListItem = styled.li`
    margin: 5px 0;
`

const InternalLink = styled(Link)`
    text-decoration: none;
    color: black;
    font-family: ${FONT_FAMILY_HEADER};
    font-weight: 100;

    &:visited {
        color: black;
    }

    &:hover {
        color: black;
    }
`

const ExternalLink = styled.a`
    text-decoration: none;
    color: black;
    font-family: ${FONT_FAMILY_HEADER};
    font-weight: 100;

    &:visited {
        color: black;
    }

    &:hover {
        color: black;
    }
`

export {
    NavigationWrapper,
    SubNavigationWrapper,
    InternalLink,
    ExternalLink,
    LinkListItem
}
