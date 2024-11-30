import React from 'react'
import styled from 'styled-components'

import List from 'src/sharedComponents/List'
import PageHeader from 'src/sharedComponents/PageHeader'
import { CONTENT_SPACING } from 'src/theme'

const ContentWrapper = styled.div`
  display: flex;
  margin: ${CONTENT_SPACING.LARGE};
  flex-direction: column;
`

const About = () => {
  return (
    <ContentWrapper>
      <PageHeader>AWARDS & RECOGNITIONS</PageHeader>
      <List
        items={[
          '2024 Master Class Selected',
          '2024 March SA Monthly Contest Winner - Envelop',
          '2023 April SA Monthly Contest Winner - Hard Light',
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

export default About
