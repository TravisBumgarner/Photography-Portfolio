import styled from 'styled-components'

import { FONT_FAMILY_HEADER, CONTENT_SPACING } from 'Theme'

const LargeHeader = styled.h1`
    font-weight: 700;
    font-family: ${FONT_FAMILY_HEADER};
    text-transform: uppercase;
    padding-bottom: ${CONTENT_SPACING / 2}vw;
    padding-top: ${CONTENT_SPACING}vw;
    font-size: 2.6em;
`

const MediumHeader = styled.h2`
    font-family: ${FONT_FAMILY_HEADER};
    font-weight: 700;
    text-transform: uppercase;
    padding-bottom: ${CONTENT_SPACING / 2}vw;
    padding-top: ${CONTENT_SPACING}vw;
    font-size: 1.9em;
`

const SmallHeader = styled.h3`
    font-family: ${FONT_FAMILY_HEADER};
    font-weight: 700;
    font-size: 1.5em;
    padding-bottom: ${CONTENT_SPACING / 2}vw;
    padding-top: ${CONTENT_SPACING / 2}vw;
`

const InlineHeader = styled.span`
    font-weight: 700;
    padding: 0 5px;
    text-transform: uppercase;
`

export { LargeHeader, MediumHeader, SmallHeader, InlineHeader }
