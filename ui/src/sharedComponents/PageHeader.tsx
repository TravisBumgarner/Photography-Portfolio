import { CONTENT_SPACING, FONT_SIZES, MOBILE_WIDTH } from 'src/theme'
import styled from 'styled-components'

export const PageHeader = styled.h2`
  font-weight: 900;
  margin-bottom: ${CONTENT_SPACING.XXLARGE};

  font-size: ${FONT_SIZES.XXLARGE};

  @media (max-width: ${MOBILE_WIDTH}) {
    font-size: ${FONT_SIZES.XLARGE};
    margin-bottom: ${CONTENT_SPACING.LARGE};
    margin-top: ${CONTENT_SPACING.MEDIUM};
  }
`
