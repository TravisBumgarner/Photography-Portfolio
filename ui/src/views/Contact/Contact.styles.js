import styled from 'styled-components'

import { PAGE_THEME } from 'Theme'

const ContactWrapper = styled(PAGE_THEME)`
    display: flex;
    align-items: center;
    justify-content: center;
`

const ContactFormWrapper = styled.div`
    margin: 0px 2vw;
    max-width: 800px;
`

export { ContactWrapper, ContactFormWrapper }
