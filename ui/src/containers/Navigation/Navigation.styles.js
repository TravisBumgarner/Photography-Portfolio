import styled from 'styled-components'

import { NavLink } from 'react-router-dom'

import { PRIMARY_COLOR, SECONDARY_COLOR } from 'Theme'

const NavigationWrapper = styled.div``

const SubNavigationWrapper = styled.div`
    margin: 30px 0;
`

const LinkListItem = styled.li`
    margin: 5px 0;
`

const SiteLink = styled(NavLink)`
    text-decoration: none;
    color: ${PRIMARY_COLOR};

    &:visited {
        color: ${PRIMARY_COLOR};
    }

    &:hover {
        color: ${SECONDARY_COLOR};
    }
`
export { NavigationWrapper, SubNavigationWrapper, SiteLink, LinkListItem }
