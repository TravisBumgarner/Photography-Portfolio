import styled from 'styled-components'

import { TRANSITION_SPEED, CONTENT_SPACING } from 'Theme'

import { FaBars, FaCaretLeft } from 'react-icons/fa'

const NavigationClose = styled(FaCaretLeft)`
    position: absolute;
    right: 20px;
    top: 20px;
    transition: opacity ${TRANSITION_SPEED / 2}s;
    opacity: ${props => (props.isNavigationVisible ? 1 : 0)};
    z-index: 999;
    fill: #ccc;

    &:hover {
        fill: #000;
    }
`

const AppWrapper = styled.div`
    /* display: flex; */
`

const NavigationWrapper = styled.div`
    box-sizing: border-box;
    height: 100vh;
    display: flex;
    align-items: center;
    margin-left: ${CONTENT_SPACING}vw;
    width: 250px;
    position: fixed;
    left: 0;
    top: 0;
    transition: left ${TRANSITION_SPEED}s;
    left: ${props => (props.isNavigationVisible ? '0' : `-230px`)};
    background-color: white;
`

export { AppWrapper, NavigationWrapper, NavigationClose }
