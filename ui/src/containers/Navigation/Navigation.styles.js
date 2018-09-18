import styled from 'styled-components'

import { Link } from 'react-router-dom'

import { FONT_FAMILY_HEADER } from 'Theme'

// TODO: Jake T Feedback on passing around dynamic theme
const NavigationWrapper = styled.div`
    /* color: ${props => props.theme.primaryColor}; */

    & a: {
        border-bottom: 1px solid green;
    }
`

const SubNavigationWrapper = styled.div`
    margin: 2vw 0;
`

const LinkListItem = styled.li`
    margin: 5px 0;
`

const InternalLink = styled(Link)`
    text-decoration: none;
    font-family: ${FONT_FAMILY_HEADER};
    font-weight: 100;
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

    &:visited {
        color: ${props => props.theme.primaryColor};
    }

    &:hover {
        color: ${props => props.theme.secondaryColor};
    }
`

export {
    NavigationWrapper,
    SubNavigationWrapper,
    InternalLink,
    ExternalLink,
    LinkListItem
}
