import { TITLE_BAR_HEIGHT_DESKTOP, TITLE_BAR_HEIGHT_MOBILE } from 'src/components/TitleBar'
import { CONTENT_SPACING, FONT_SIZES, MOBILE_WIDTH } from 'src/theme'
import styled from 'styled-components'

export const PageHeader = styled.h2`
  font-weight: 900;
  margin-bottom: ${CONTENT_SPACING.XXLARGE};
  margin-top: calc(${CONTENT_SPACING.XLARGE} + ${TITLE_BAR_HEIGHT_DESKTOP});

  font-size: ${FONT_SIZES.XXLARGE};

  @media (max-width: ${MOBILE_WIDTH}) {
    font-size: ${FONT_SIZES.XLARGE};
    margin-bottom: ${CONTENT_SPACING.LARGE};
    margin-top: calc(${CONTENT_SPACING.MEDIUM} + ${TITLE_BAR_HEIGHT_MOBILE});
  }
`
