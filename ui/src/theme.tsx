import { createGlobalStyle } from 'styled-components'

const TRANSITION_SPEED = 1
const CONTENT_SPACING = {
  xs: '0.125rem',
  s: '0.25rem',
  m: '0.5rem',
  l: '1rem',
  xl: '2rem',
  xxl: '4rem',
  xxxl: '8rem',
  xxxxl: '16rem'
}

const HEADER_FONT_SIZES = {
  s: '1.0rem',
  m: '1.2rem',
  l: '1.5rem'
}

const TEXT_FONT_SIZES = {
  m: '1.0rem'
}

const ICON_COLOR = {
  initial: '#000',
  hover: 'rgb(74, 207, 160)'
}

const ICON_FONT_SIZES = {
  s: '1.0rem',
  m: '1.2rem',
  l: '1.5rem',
  xl: '2.0rem'
}

const FONT_FAMILY_HEADER = "'Raleway', sans-serif;"
const FONT_FAMILY_TEXT = "'Montserrat', sans-serif"

const FONT_SIZE_INPUTS_AND_BUTTONS = 14

const GlobalStyle = createGlobalStyle`
    :root {
        --doc-height: 100%;
    }

    body {
        font-size: 18px;
        margin: 4rem;
        box-sizing: border-box;
        font-weight: 400;

        @media (max-width: 768px) {
            margin: 1rem;
        }
    }

    

`

export {
  CONTENT_SPACING, FONT_FAMILY_HEADER, FONT_FAMILY_TEXT, FONT_SIZE_INPUTS_AND_BUTTONS, GlobalStyle, HEADER_FONT_SIZES, ICON_COLOR, ICON_FONT_SIZES, TEXT_FONT_SIZES, TRANSITION_SPEED
}
