import styled from 'styled-components'

import { FONT_SIZE_INPUTS_AND_BUTTONS } from '../../theme'

const StyledInput = styled.input`
    width: 100%;
    background-color: rgba(255, 255, 255, 0.7);
    border: 0px;
    border-bottom: 2px solid rgba(255, 255, 255, 1);
    font-size: ${FONT_SIZE_INPUTS_AND_BUTTONS}px;
`

export { StyledInput }
