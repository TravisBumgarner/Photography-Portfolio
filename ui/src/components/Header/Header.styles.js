import styled from 'styled-components'

import { FONT_FAMILY_HEADER } from 'Theme'

const LargeHeader = styled.h1`
    font-weight: 700;
    font-family: ${FONT_FAMILY_HEADER};
    text-transform: uppercase;
    margin-bottom: 5px;
`

const MediumHeader = styled.h2`
    font-family: ${FONT_FAMILY_HEADER};
    font-weight: 400;
    text-transform: uppercase;
    margin-bottom: 5px;
`

const SmallHeader = styled.h3`
    font-weight: 100;
    margin-bottom: 5px;
`

export { LargeHeader, MediumHeader, SmallHeader }
