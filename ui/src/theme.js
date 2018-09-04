import styled from 'styled-components'

const MAX_IMAGE_SIDE_LENGTH = 1400 // TODO: - Set this later

const FONT_FAMILY_HEADER = "'Montserrat', sans-serif"
const FONT_FAMILY_TEXT = "'Montserrat', sans-serif"

const FONT_SIZE_INPUTS_AND_BUTTONS = 20

const PRIMARY_COLOR = '#5C5C5C'
const SECONDARY_COLOR = '#588596'

const PAGE_THEME = styled.div`
    max-width: ${MAX_IMAGE_SIDE_LENGTH}px;
    max-height: ${MAX_IMAGE_SIDE_LENGTH}px;
    width: 100%;
    height: 100%;
    overflow: scroll;
`

const SCREEN_BREAK_POINTS = {
    GIANT: 1170,
    DESKTOP: 992,
    TABLET: 768,
    PHONE: 376
}

export {
    PAGE_THEME,
    FONT_FAMILY_TEXT,
    FONT_FAMILY_HEADER,
    PRIMARY_COLOR,
    SECONDARY_COLOR,
    SCREEN_BREAK_POINTS,
    FONT_SIZE_INPUTS_AND_BUTTONS
}
