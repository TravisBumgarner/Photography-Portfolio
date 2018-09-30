import styled, { createGlobalStyle } from 'styled-components'

const TRANSITION_SPEED = 1
const CONTENT_SPACING = {
    s: '0.25rem',
    m: '0.5rem',
    l: '1rem',
    xl: '2rem'
}
const HEADER_FONT_SIZES = {
    s: '1.4rem',
    m: '1.7rem',
    l: '2rem'
}

const TEXT_FONT_SIZES = {
    m: '1.0rem'
}

const ICON_FONT_SIZES = {
    ...HEADER_FONT_SIZES
}

const FONT_FAMILY_HEADER = "'Raleway', sans-serif;"
const FONT_FAMILY_TEXT = "'Montserrat', sans-serif"

const FONT_SIZE_INPUTS_AND_BUTTONS = 14

const PAGE_THEME = styled.div`
    padding: ${CONTENT_SPACING.l};
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

const GlobalStyle = createGlobalStyle`
    body {
        background-image: url('http://localhost:8000/media/full/2017/Alaska/270.jpg');
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
        font-size: 20px;
    }
`

export {
    MEDIA,
    GlobalStyle,
    generateTheme,
    PAGE_THEME,
    FONT_FAMILY_TEXT,
    FONT_FAMILY_HEADER,
    FONT_SIZE_INPUTS_AND_BUTTONS,
    TRANSITION_SPEED,
    CONTENT_SPACING,
    HEADER_FONT_SIZES,
    TEXT_FONT_SIZES,
    ICON_FONT_SIZES
}
