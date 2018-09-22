import styled, { createGlobalStyle } from 'styled-components'

const generateTheme = ({ primaryColor, secondaryColor, backgroundSrc }) => ({
    primaryColor,
    secondaryColor,
    backgroundSrc
})

const TRANSITION_SPEED = '0.5s'

const FONT_FAMILY_HEADER = "'Raleway', sans-serif;"
const FONT_FAMILY_TEXT = "'Montserrat', sans-serif"

const FONT_SIZE_INPUTS_AND_BUTTONS = 14

const PAGE_THEME = styled.div`
    overflow: scroll;
`
// background-image: ${props => `url(${props.isBackgroundVisible ? props.theme.backgroundSrc : ''});`};
const GlobalStyle = createGlobalStyle`
    body {
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
        background-attachment: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        position: absolute;
        z-index: -1;
    }
`

export {
    GlobalStyle,
    generateTheme,
    PAGE_THEME,
    FONT_FAMILY_TEXT,
    FONT_FAMILY_HEADER,
    PRIMARY_COLOR,
    SECONDARY_COLOR,
    FONT_SIZE_INPUTS_AND_BUTTONS,
    TRANSITION_SPEED
}
