import styled from 'styled-components'

import { TRANSITION_SPEED, CONTENT_SPACING } from 'Theme'

import { FaBars, FaCaretRight } from 'react-icons/fa'

const NavigationClose = styled(FaCaretRight)`
    position: absolute;
    top: 20px;
    left: 7px;
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
    padding-left: ${CONTENT_SPACING}vw;
    position: fixed;
    right: 0;
    top: 0;
    transition: right ${TRANSITION_SPEED}s;
    right: ${props => (props.isNavigationVisible ? '0' : `-50vw`)};
    background-color: white;
    border-left: 5px solid black;
`

export { AppWrapper, NavigationWrapper, NavigationClose }
