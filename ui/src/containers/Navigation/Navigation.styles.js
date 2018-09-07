import styled from 'styled-components'

import { NavLink } from 'react-router-dom'

const NavigationWrapper = styled.div`
    color: ${props => props.theme.primaryColor} !important;
`

const SubNavigationWrapper = styled.div`
    margin: 30px 0;
`

const LinkListItem = styled.li`
    margin: 5px 0;
`

const SiteLink = styled(NavLink)`
    text-decoration: none;
    color: ${props => props.theme.primaryColor};

    &:visited {
        color: ${props => props.theme.primaryColor};
    }

    &:hover {
        color: ${props => props.themePrimaryColor};
    }
`
export { NavigationWrapper, SubNavigationWrapper, SiteLink, LinkListItem }
