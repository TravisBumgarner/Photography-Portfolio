import styled from 'styled-components'

import { FONT_SIZE_INPUTS_AND_BUTTONS, FONT_FAMILY_TEXT } from 'Theme'

const StyledInput = styled.input`
    width: 100%;
    font-family: ${FONT_FAMILY_TEXT};
    background-color: rgba(0, 0, 0, 0);
    padding: 15px;
    box-sizing: border-box;
    margin: 10px 0;
    border: 0px;
    border-bottom: 2px solid ${props => props.theme.secondaryColor};
    font-size: ${FONT_SIZE_INPUTS_AND_BUTTONS}px;

    &::placeholder {
        color: ${props => props.theme.primaryColor};
        text-transform: uppercase;
    }
`
const StyledTextArea = styled.textarea`
    width: 100%;
    font-family: ${FONT_FAMILY_TEXT};
    background-color: rgba(0, 0, 0, 0);
    padding: 15px;
    box-sizing: border-box;
    margin: 10px 0;
    border: 0px;
    border-bottom: 2px solid ${props => props.theme.secondaryColor};
    font-size: ${FONT_SIZE_INPUTS_AND_BUTTONS}px;

    &::placeholder {
        color: ${props => props.theme.primaryColor};
        text-transform: uppercase;
    }
`

export { StyledInput, StyledTextArea }
