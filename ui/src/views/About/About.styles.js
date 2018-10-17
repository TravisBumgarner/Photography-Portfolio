import styled from 'styled-components'

import { PAGE_THEME, CONTENT_SPACING } from 'Theme'

const ContentSection = styled.div`
    flex: 1;
`

const ContentWrapper = styled.div`
    display: flex;
`
const ContentSubWrapperLeft = styled.div`
    max-width: 300px;
    box-sizing: border-box;
    padding-right: ${CONTENT_SPACING.m};
`
const ContentSubWrapperRight = styled.div`
    padding-left: ${CONTENT_SPACING.m};
    flex-grow: 1;
`

const Portrait = styled.img`
    width: 100%;
    height: auto;
    margin-top: ${CONTENT_SPACING.xs};
`

const AboutWrapper = styled(PAGE_THEME)``

export { Portrait, AboutWrapper, ContentSection, ContentWrapper, ContentSubWrapperLeft, ContentSubWrapperRight }
