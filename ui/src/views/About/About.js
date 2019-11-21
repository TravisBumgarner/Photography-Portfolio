import React from 'react'

import { Text, Header } from 'Components'

import {
    AboutWrapper,
    ContentSection,
    ContentWrapper,
    ContentSubWrapperLeft,
    ContentSubWrapperRight,
    Portrait
} from './About.styles'

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
