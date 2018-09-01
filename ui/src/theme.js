import styled from 'styled-components'

const MAX_IMAGE_SIDE_LENGTH = 1400 // TODO: - Set this later

const PAGE_THEME = styled.div`
    max-width: ${MAX_IMAGE_SIDE_LENGTH}px;
    max-height: ${MAX_IMAGE_SIDE_LENGTH}px;
    width: 800px;
    height: 800px;
    background-color: grey;
`

export { PAGE_THEME }
