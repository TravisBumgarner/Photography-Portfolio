import styled from 'styled-components'
import { CONTENT_SPACING, FONT_SIZES } from 'theme'

export const PageHeader = styled.h2`
  font-weight: 900;
  margin-bottom: ${CONTENT_SPACING.XXLARGE};
  margin-top: ${CONTENT_SPACING.XLARGE};
  font-size: ${FONT_SIZES.XXLARGE};

  @media (max-width: 1000px) {
    font-size: ${FONT_SIZES.XLARGE};
  }
`
