import styled from 'styled-components'

import { FONT_FAMILY_BODY } from '../../theme'

const DefaultBody = styled.p`
    font-family: ${FONT_FAMILY_BODY};
`

const LargeBody = DefaultBody.extend`
    color: bisque;
`

const MediumBody = DefaultBody.extend`
    color: red;
`

const SmallBody = DefaultBody.extend`
    color: pink;
`

export { LargeBody, MediumBody, SmallBody }
