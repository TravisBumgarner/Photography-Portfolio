import styled from 'styled-components'

import { FONT_FAMILY_HEADER } from '../../theme'

const DefaultHeader = styled.p`
    font-family: ${FONT_FAMILY_HEADER};
`

const LargeHeader = DefaultHeader.extend`
    font-weight: 700;
`

const MediumHeader = DefaultHeader.extend`
    font-weight: 400;
`

const SmallHeader = DefaultHeader.extend`
    font-weight: 100;
`

export { LargeHeader, MediumHeader, SmallHeader }
