import styled from 'styled-components'

import { TRANSITION_SPEED, CONTENT_SPACING } from 'Theme'

import { FaCaretRight, FaCaretLeft } from 'react-icons/fa'

const NavigationOpen = styled(FaCaretRight)`
    position: absolute;
    right: 0;
    top: 50vh;
    transition: opacity ${TRANSITION_SPEED / 2}s;
    opacity: ${props => (props.isNavigationVisible ? 0 : 1)};
    z-index: 999;
`

const NavigationClose = styled(FaCaretLeft)`
    position: absolute;
    right: 0;
    top: 50vh;
    transition: opacity ${TRANSITION_SPEED / 2}s;
    opacity: ${props => (props.isNavigationVisible ? 1 : 0)};
    z-index: 999;
`

const AppWrapper = styled.div`
    display: flex;
`

const ContentWrapper = styled.div`
    height: 100vh;
    box-sizing: border-box;
    flex: 1;
    width: 96vw;
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

export { AppWrapper, NavigationWrapper, ContentWrapper, NavigationOpen, NavigationClose }
