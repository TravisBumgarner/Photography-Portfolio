import React, { Component } from 'react'

import { Text, Header } from 'Components'

import { AboutWrapper, ContentSection, ContentWrapper } from './About.styles'

class About extends Component {
    render() {
        return (
            <AboutWrapper>
                <Header size="medium">About</Header>
                <ContentWrapper>
                    <ContentSection>
                        <Header size="small">Location</Header>
                        <Text size="medium">Boston, MA</Text>

                        <Header size="small">Summary</Header>
                        <Text size="medium">
                            Software Engineer
                            <br />
                            Photographer
                            <br />
                            Maker
                            <br />
                            Designer
                        </Text>

                        <Header size="small">AWARDS & RECOGNITIONS</Header>
                        <Text size="medium">
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
                </ContentWrapper>
            </AboutWrapper>
        )
    }
}

export default About
