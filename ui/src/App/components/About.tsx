import React from 'react'
import styled from 'styled-components'

import { Header, List } from 'sharedComponents'

const ContentWrapper = styled.div`
    display: flex;
    margin: 1rem;
    flex-direction: column;
`

const About = () => {
  return (
    <ContentWrapper>
      <Header size="large">AWARDS & RECOGNITIONS</Header>
      <List
        items={[
          '2023 Black Box Gallery - Color Burst',
          '2023 Praxis Gallery - The Portrait Exhibition',
          '2018 Noyes Museum of Art of Stockton University - RAW Exhibition',
          '2017 1st Place BARPCV Photography Competition',
          '2016 Front Page of National Geographic\'s YourShot',
          '2016 MIT Art Party',
        ]}
      />

    </ContentWrapper>
  )
}

export default About