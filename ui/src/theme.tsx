import { createGlobalStyle } from 'styled-components'

export const TRANSITION_SPEED = 1
export const CONTENT_SPACING = {
  XSMALL: '0.125rem',
  SMALL: '0.25rem',
  MEDIUM: '0.5rem',
  LARGE: '1rem',
  XLARGE: '2rem',
  XXLARGE: '4rem',
  XXXLARGE: '8rem',
  XXXXLARGE: '16rem'
}

export const FONT_SIZES = {
  XSMALL: '0.7rem',
  SMALL: '1.0rem',
  MEDIUM: '1.2rem',
  LARGE: '1.5rem',
  XLARGE: '2.5rem',
  XXLARGE: '6rem'
}

export const COLORS = {
  GREEN: 'rgb(74, 207, 160)',
  BLACK: 'rgb(0, 0, 0)'
}

export const GlobalStyle = createGlobalStyle`
    :root {
        --doc-height: 100%;
    }

    @font-face {
      font-family: 'Satoshi';
      src: url('/fonts/Satoshi-Variable.ttf') format('truetype');
      font-weight: 100 900;
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
