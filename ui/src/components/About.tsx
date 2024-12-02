import React from 'react'
import styled from 'styled-components'

import NavigationAnimation from 'src/sharedComponents/NavigationAnimation'
import PageHeader from 'src/sharedComponents/PageHeader'
import { CONTENT_SPACING } from 'src/theme'

const ContentWrapper = styled.div`
  display: flex;
  margin: ${CONTENT_SPACING.LARGE} 0;
  flex-direction: column;
`

const About = () => {
  return (
    <NavigationAnimation>
      <ContentWrapper>
        <PageHeader>AWARDS & RECOGNITIONS</PageHeader>
        <UL>
          <li>2024 Master Class Selected</li>
          <li>2024 March SA Monthly Contest Winner - Envelop</li>
          <li>2023 April SA Monthly Contest Winner - Hard Light</li>
          <li>2023 Black Box Gallery - Color Burst</li>
          <li>2023 Praxis Gallery - The Portrait Exhibition</li>
          <li>
            2018 Noyes Museum of Art of Stockton University - RAW Exhibition
          </li>
          <li>2017 1st Place BARPCV Photography Competition</li>
          <li>2016 Front Page of National Geographic&apos;s YourShot</li>
          <li>2016 MIT Art Party</li>
        </UL>
      </ContentWrapper>
    </NavigationAnimation>
  )
}

const UL = styled.ul`
  margin: 0;
  padding: 0;

  li {
    margin-bottom: ${CONTENT_SPACING.MEDIUM};
  }
`

export default About
