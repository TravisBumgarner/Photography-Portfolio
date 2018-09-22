import styled from 'styled-components'

import { FONT_FAMILY_HEADER } from 'Theme'

const LargeHeader = styled.h1`
    font-weight: 400;
    font-family: ${FONT_FAMILY_HEADER};
    text-transform: uppercase;
    margin-bottom: 10px;
    font-size: 30px;
`

const InlineHeader = styled.span`
    font-weight: 700;
`

const MediumHeader = styled.h2`
    font-family: ${FONT_FAMILY_HEADER};
    font-weight: 400;
    text-transform: uppercase;
    margin-bottom: 10px;
    font-size: 30px;
`

const SmallHeader = styled.h3`
    font-family: ${FONT_FAMILY_HEADER};
    font-weight: 200;
    font-size: 30px;
    margin-bottom: 10px;
`

export { LargeHeader, MediumHeader, SmallHeader, InlineHeader }
