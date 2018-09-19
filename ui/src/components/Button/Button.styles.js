import styled from 'styled-components'

import { FONT_SIZE_INPUTS_AND_BUTTONS, FONT_FAMILY_TEXT } from 'Theme'

const StyledButton = styled.button`
    width: 100%;
    border: 0px;
    font-family: ${FONT_FAMILY_TEXT};
    padding: 15px;
    box-sizing: border-box;
    margin: 10px 0;
    font-size: ${FONT_SIZE_INPUTS_AND_BUTTONS}px;
    text-transform: uppercase;
    color: ${props => props.theme.primaryColor};
    background-color: rgba(0, 0, 0, 0);
`

export { StyledButton }
