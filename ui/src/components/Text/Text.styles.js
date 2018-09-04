import styled from 'styled-components'

import { FONT_FAMILY_TEXT } from '../../theme'

const DefaultText = styled.p`
    font-family: ${FONT_FAMILY_TEXT};
`

const LargeText = DefaultText.extend`
    color: bisque;
`

const MediumText = DefaultText.extend`
    color: red;
`

const SmallText = DefaultText.extend`
    color: pink;
`

export { LargeText, MediumText, SmallText }
