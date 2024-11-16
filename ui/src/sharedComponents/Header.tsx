import React from 'react'
import styled from 'styled-components'

import { CONTENT_SPACING, FONT_FAMILY_HEADER, HEADER_FONT_SIZES } from '../theme'

interface Props { size: string, children: any }

const LargeHeader = styled.h1`
    font-weight: 700;
    font-family: ${FONT_FAMILY_HEADER};
    text-transform: uppercase;
    margin-bottom: ${CONTENT_SPACING.l};
    margin-top: ${CONTENT_SPACING.l};
    font-size: ${HEADER_FONT_SIZES.l};
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
    case 'small':
      return <SmallHeader>{children}</SmallHeader>
    case 'inline':
      return <InlineHeader>{children}</InlineHeader>
    default:
      return <SmallHeader>{children}</SmallHeader>
  }
}

export default Header
