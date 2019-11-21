import styled from 'styled-components'

import { PAGE_THEME, TRANSITION_SPEED } from 'Theme'

const HomeWrapper = styled(PAGE_THEME)`
    background-image: ${props => `url('${props.backgroundImageUrl}')`};
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
