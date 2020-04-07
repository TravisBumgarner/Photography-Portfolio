import React from 'react'
import styled from 'styled-components'

import { Text, Header } from 'sharedComponents'
import { PAGE_THEME, CONTENT_SPACING } from 'theme'

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

const About = () => {
    return (
        <AboutWrapper>
            <Header size="medium">About</Header>
            <ContentWrapper>
                <ContentSubWrapperLeft>
                    <Portrait src="http://api.travisbumgarner.photography/static/images/travis.jpg" />
                </ContentSubWrapperLeft>
                <ContentSubWrapperRight>
                    <ContentSection>
                        <Header size="small">Location</Header>
                        <Text>Boston, MA</Text>

                        <Header size="small">Summary</Header>
                        <Text>
                            Software Engineer
                            <br />
                            Photographer
                            <br />
                            Maker
                            <br />
                            Designer
                        </Text>

                        <Header size="small">AWARDS & RECOGNITIONS</Header>
                        <Text>
                            2018 Noyes Museum of Art of Stockton University's RAW Exhibition
                            <br />
                            2017 1st Place BARPCV Photography Competition
                            <br />
                            2016 Front Page of National Geographic’s YourShot
                            <br />
                            2016 MIT Art Party
                            <br />
                        </Text>
                    </ContentSection>
                </ContentSubWrapperRight>
            </ContentWrapper>
        </AboutWrapper>
    )
}

export default About
