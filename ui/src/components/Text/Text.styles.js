import styled from 'styled-components'

import { FONT_FAMILY_TEXT, PRIMARY_COLOR } from 'Theme'

const DefaultText = styled.p`
    font-family: ${FONT_FAMILY_TEXT};
    color: ${PRIMARY_COLOR};
    margin: 20px 0;
    line-height: 1.5;
`

const LargeText = DefaultText.extend`
    font-size: 20px;
`

const MediumText = DefaultText.extend`
    font-size: 14px;
`

const SmallText = DefaultText.extend`
    font-size: 10px;
`

export { LargeText, MediumText, SmallText }
