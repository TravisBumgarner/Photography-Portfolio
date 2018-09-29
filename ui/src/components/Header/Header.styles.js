import styled, { css } from 'styled-components'

import { FONT_FAMILY_HEADER, CONTENT_SPACING } from 'Theme'

const sharedStyles = props => css`
    font-weight: 700;
    font-family: ${FONT_FAMILY_HEADER};
`

const LargeHeader = styled.h1`
    ${props => sharedStyles(props)};
    text-transform: uppercase;
    padding-bottom: ${CONTENT_SPACING.l};
    padding-top: ${CONTENT_SPACING.l};
    font-size: 2.6em;
`

const MediumHeader = styled.h2`
    ${props => sharedStyles(props)};
    text-transform: uppercase;
    padding-bottom: ${CONTENT_SPACING.m};
    padding-top: ${CONTENT_SPACING.m};
    font-size: 1.9em;
`

const SmallHeader = styled.h3`
    ${props => sharedStyles(props)};
    font-size: 1.5em;
    padding-bottom: ${CONTENT_SPACING.s};
    padding-top: ${CONTENT_SPACING.s};
`

const InlineHeader = styled.span`
    padding: 0 5px;
    text-transform: uppercase;
`

export { LargeHeader, MediumHeader, SmallHeader, InlineHeader }
