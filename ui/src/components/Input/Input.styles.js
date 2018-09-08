import styled from 'styled-components'

import { FONT_SIZE_INPUTS_AND_BUTTONS, FONT_FAMILY_TEXT } from 'Theme'

const StyledInput = styled.input`
    width: 100%;
    font-family: ${FONT_FAMILY_TEXT};
    text-transform: uppercase;
    background-color: rgba(0, 0, 0, 0.1);
    padding: 15px;
    box-sizing:border-box
    margin: 10px 0;
    border: 0px;
    border-bottom: 2px solid rgba(255, 255, 255, 1);
    font-size: ${FONT_SIZE_INPUTS_AND_BUTTONS}px;
`

export { StyledInput }
