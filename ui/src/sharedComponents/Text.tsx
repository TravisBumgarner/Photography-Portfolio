import React from 'react'
import styled from 'styled-components'

import { CONTENT_SPACING, FONT_FAMILY_TEXT, TEXT_FONT_SIZES } from '../theme'

const DefaultText = styled.p`
    font-family: ${FONT_FAMILY_TEXT};
    line-height: 1.5;
    padding-bottom: ${CONTENT_SPACING.m};
    padding-top: ${CONTENT_SPACING.m};

    &:first-child {
        margin: 0;
    }

    &:last-child {
        margin: 0;
    }
`

const MediumText = styled(DefaultText)`
    font-size: ${TEXT_FONT_SIZES.m};
`

interface Props {
  children: any
}

const Text = ({ children }: Props) => {
  return <MediumText>{children}</MediumText>
}

export default Text
