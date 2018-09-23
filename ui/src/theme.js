import styled, { createGlobalStyle } from 'styled-components'

const generateTheme = ({ primaryColor, secondaryColor, backgroundSrc }) => ({
    primaryColor,
    secondaryColor,
    backgroundSrc
})

const TRANSITION_SPEED = 1

const FONT_FAMILY_HEADER = "'Raleway', sans-serif;"
const FONT_FAMILY_TEXT = "'Montserrat', sans-serif"

const FONT_SIZE_INPUTS_AND_BUTTONS = 14

const PAGE_THEME = styled.div`
    overflow: scroll;
`

const sizes = {
    desktop: 992,
    tablet: 768,
    phone: 576
}

// Iterate through the sizes and create a media template
const MEDIA = Object.keys(sizes).reduce((acc, label) => {
    acc[label] = (...args) => css`
        @media (max-width: ${sizes[label] / 16}em) {
            ${css(...args)};
        }
    `
    return acc
}, {})

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
    MEDIA,
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
