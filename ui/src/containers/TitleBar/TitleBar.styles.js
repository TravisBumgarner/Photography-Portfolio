import styled from 'styled-components'
import { FaBars } from 'react-icons/fa'

import { CONTENT_SPACING, TRANSITION_SPEED } from 'Theme'

const TitleBarWrapper = styled.div`
    width: 100vw;
    box-sizing: border-box;
    padding: 0 ${CONTENT_SPACING * 2}vw;
    display: flex;
    justify-content: space-between;
`

const NavigationOpen = styled(FaBars)`
    fill: #ccc;
    padding-bottom: 1vw;
    padding-top: 2vw;

    &:hover {
        fill: #000;
    }
`

export { TitleBarWrapper, NavigationOpen }
