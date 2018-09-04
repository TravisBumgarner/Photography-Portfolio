import styled from 'styled-components'

const MAX_IMAGE_SIDE_LENGTH = 1400 // TODO: - Set this later

const FONT_FAMILY_HEADER = "'Montserrat', sans-serif"
const FONT_FAMILY_TEXT = "'Montserrat', sans-serif"

const PRIMARY_COLOR = '#5C5C5C'
const SECONDARY_COLOR = '#588596'

const PAGE_THEME = styled.div`
    max-width: ${MAX_IMAGE_SIDE_LENGTH}px;
    max-height: ${MAX_IMAGE_SIDE_LENGTH}px;
    width: 800px;
    height: 800px;
`

export {
    PAGE_THEME,
    FONT_FAMILY_TEXT,
    FONT_FAMILY_HEADER,
    PRIMARY_COLOR,
    SECONDARY_COLOR
}
