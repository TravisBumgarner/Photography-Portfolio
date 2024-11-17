import { createGlobalStyle } from 'styled-components'

export const TRANSITION_SPEED = 1
export const CONTENT_SPACING = {
  xs: '0.125rem',
  s: '0.25rem',
  m: '0.5rem',
  l: '1rem',
  xl: '2rem',
  xxl: '4rem',
  xxxl: '8rem',
  xxxxl: '16rem'
}

export const FONT_SIZES = {
  SMALL: '1.0rem',
  MEDIUM: '1.2rem',
  LARGE: '1.5rem',
  XXLARGE: '4rem'
}

export const ICON_COLOR = {
  initial: '#000',
  hover: 'rgb(74, 207, 160)'
}

export const ICON_FONT_SIZE = '1.5rem'

export const GlobalStyle = createGlobalStyle`
    :root {
        --doc-height: 100%;
    }

    @font-face {
      font-family: 'Satoshi';
      src: url('/fonts/Satoshi-Variable.ttf') format('truetype');
      font-weight: normal;
      font-style: normal;
    } 

    body {
        font-size: 18px;
        margin: 4rem;
        box-sizing: border-box;
        font-weight: 400;
        font-family: 'Satoshi', sans-serif;

        @media (max-width: 768px) {
            margin: 1rem;
        }
    }
`
