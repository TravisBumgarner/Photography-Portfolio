import styled from 'styled-components'

import { FONT_FAMILY_TEXT } from 'Theme'

const DefaultText = styled.p`
    font-family: ${FONT_FAMILY_TEXT};
    margin: 20px 0;
    line-height: 1.5;
`

const LargeText = styled(DefaultText)`
    font-size: 20px;
`

const MediumText = styled(DefaultText)`
    font-size: 20px;
`

const SmallText = styled(DefaultText)`
    font-size: 20px;
`

export { LargeText, MediumText, SmallText }
