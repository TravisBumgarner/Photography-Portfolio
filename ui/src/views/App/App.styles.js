import styled from 'styled-components'

import { TRANSITION_SPEED } from 'Theme'

import { FaCaretRight } from 'react-icons/fa'

const NavigationToggle = styled(FaCaretRight)`
    position: fixed;
    left: 0;
    top: 50vh;
    transition: opacity ${TRANSITION_SPEED};
    opacity: ${props => (props.isNavigationVisible ? 0 : 1)};
    z-index: 999;
`

const AppWrapper = styled.div`
    width: 100vw;
    height: 100vh;

    &:after {
        content: '';
        background-image: ${props => `url(${props.theme.backgroundSrc});`};
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        background-attachment: fixed;
        opacity: 0.2;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        position: absolute;
        z-index: -1;
    }
`

const ContentWrapper = styled.div`
    height: 100vh;
    transition: left ${TRANSITION_SPEED}, width ${TRANSITION_SPEED};
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
    position: absolute;
    left: 0;
    top: 0;
    transition: left ${TRANSITION_SPEED};
    left: ${props => (props.isNavigationVisible ? '0' : `-15vw`)};
`

export { AppWrapper, NavigationWrapper, ContentWrapper, NavigationToggle }
