import styled from 'styled-components'

import { PAGE_THEME } from 'Theme'

const HomeWrapper = styled(PAGE_THEME)`
    background-image: ${({ backgroundImageUrl }: { backgroundImageUrl: string }) => `url('https://storage.googleapis.com/photo21/photos/${backgroundImageUrl}')`};
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    background-attachment: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    position: fixed;
    z-index: 0;
`

export { HomeWrapper }
