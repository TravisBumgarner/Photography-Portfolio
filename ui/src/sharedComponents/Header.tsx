import React from 'react'
import styled, { css } from 'styled-components'

import { FONT_FAMILY_HEADER, CONTENT_SPACING, HEADER_FONT_SIZES } from 'theme'

type Props = { size: string, children: any }

const LargeHeader = styled.h1`
    font-weight: 700;
    font-family: ${FONT_FAMILY_HEADER};
    text-transform: uppercase;
    margin-bottom: ${CONTENT_SPACING.l};
    margin-top: ${CONTENT_SPACING.l};
    font-size: ${HEADER_FONT_SIZES.l};
`

const MediumHeader = styled.h2`
    font-weight: 700;
    font-family: ${FONT_FAMILY_HEADER};
    text-transform: uppercase;
    margin-bottom: ${CONTENT_SPACING.m};
    margin-top: ${CONTENT_SPACING.m};
    font-size: ${HEADER_FONT_SIZES.m};
`

const SmallHeader = styled.h3`
    font-weight: 700;
    font-family: ${FONT_FAMILY_HEADER};
    font-size: ${HEADER_FONT_SIZES.s};
    margin-bottom: ${CONTENT_SPACING.s};
    margin-top: ${CONTENT_SPACING.s};
`

const InlineHeader = styled.span`
    margin: 0 5px;
    text-transform: uppercase;
    font-weight: 700;
`

const Header = ({ size, children }: Props) => {
    switch (size) {
        case 'large':
            return <LargeHeader>{children}</LargeHeader>
        case 'medium':
            return <MediumHeader>{children}</MediumHeader>
        case 'small':
            return <SmallHeader>{children}</SmallHeader>
        case 'inline':
            return <InlineHeader>{children}</InlineHeader>
        default:
            return <SmallHeader>{children}</SmallHeader>
    }
}

export default Header
