import styled from 'styled-components'

import { FONT_FAMILY_TEXT, CONTENT_SPACING } from 'Theme'

const DefaultText = styled.p`
    font-family: ${FONT_FAMILY_TEXT};
    line-height: 1.5;
    padding-bottom: ${CONTENT_SPACING / 2}vw;
    padding-top: ${CONTENT_SPACING / 2}vw;
`

const LargeText = styled(DefaultText)`
    font-size: 18px;
`

const MediumText = styled(DefaultText)`
    font-size: 18px;
`

const SmallText = styled(DefaultText)`
    font-size: 18px;
`

export { LargeText, MediumText, SmallText }
