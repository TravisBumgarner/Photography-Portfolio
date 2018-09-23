import styled from 'styled-components'

import { TRANSITION_SPEED } from 'Theme'

import { FaCaretRight, FaCaretLeft } from 'react-icons/fa'

const NavigationOpen = styled(FaCaretRight)`
    position: fixed;
    left: 0;
    top: 50vh;
    transition: opacity ${TRANSITION_SPEED / 2}s;
    opacity: ${props => (props.isNavigationVisible ? 0 : 1)};
    z-index: 999;
`

const NavigationClose = styled(FaCaretLeft)`
    position: fixed;
    left: 0;
    top: 50vh;
    transition: opacity ${TRANSITION_SPEED / 2}s;
    opacity: ${props => (props.isNavigationVisible ? 1 : 0)};
    z-index: 999;
`

const AppWrapper = styled.div``

const ContentWrapper = styled.div`
    height: 100vh;
    transition: left ${TRANSITION_SPEED}s, width ${TRANSITION_SPEED}s;
    position: absolute;
    box-sizing: border-box;
    right: 0;
    top: 0;
    margin: 0 2vw;
    width: ${props => (props.isNavigationVisible ? `79vw` : `96vw`)};
`

const NavigationWrapper = styled.div`
    height: 100vh;
    display: flex;
    align-items: center;
    margin-left: 2vw;
    width: 15vw;
    position: fixed;
    left: 0;
    top: 0;
    transition: left ${TRANSITION_SPEED}s;
    left: ${props => (props.isNavigationVisible ? '0' : `-15vw`)};
`

export { AppWrapper, NavigationWrapper, ContentWrapper, NavigationOpen, NavigationClose }
