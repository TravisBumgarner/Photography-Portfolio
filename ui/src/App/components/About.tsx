import React from 'react'
import styled from 'styled-components'

import { List } from 'sharedComponents'
import { CONTENT_SPACING, FONT_SIZES } from 'theme'

const ContentWrapper = styled.div`
  display: flex;
  margin: 1rem;
  flex-direction: column;
`

const About = () => {
  return (
    <ContentWrapper>
      <Header>AWARDS & RECOGNITIONS</Header>
      <List
        items={[
          '2023 Black Box Gallery - Color Burst',
          '2023 Praxis Gallery - The Portrait Exhibition',
          '2018 Noyes Museum of Art of Stockton University - RAW Exhibition',
          '2017 1st Place BARPCV Photography Competition',
          "2016 Front Page of National Geographic's YourShot",
          '2016 MIT Art Party'
        ]}
      />
    </ContentWrapper>
  )
}

const Header = styled.h1`
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: ${CONTENT_SPACING.l};
  margin-top: ${CONTENT_SPACING.l};
  font-size: ${FONT_SIZES.LARGE};
`

export default About
