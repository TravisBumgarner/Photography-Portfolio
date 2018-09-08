import styled from 'styled-components'

const generateTheme = ({ primaryColor, secondaryColor, backgroundSrc }) => ({
    primaryColor,
    secondaryColor,
    backgroundSrc
})

const MAX_IMAGE_SIDE_LENGTH = 1400 // TODO: - Set this later

const FONT_FAMILY_HEADER = "'Raleway', sans-serif;"
const FONT_FAMILY_TEXT = "'Montserrat', sans-serif"

const FONT_SIZE_INPUTS_AND_BUTTONS = 20

const PAGE_THEME = styled.div`
    max-width: ${MAX_IMAGE_SIDE_LENGTH}px;
    max-height: ${MAX_IMAGE_SIDE_LENGTH}px;
    width: 100%;
    height: 100%;
    overflow: scroll;
`

export {
    generateTheme,
    PAGE_THEME,
    FONT_FAMILY_TEXT,
    FONT_FAMILY_HEADER,
    PRIMARY_COLOR,
    SECONDARY_COLOR,
    FONT_SIZE_INPUTS_AND_BUTTONS
}
