import React from 'react'
import styled from 'styled-components'

import { CONTENT_SPACING } from 'theme'
import { getData } from '../content'
import GalleryPreview from './GalleryPreview'
const HomeImageWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${CONTENT_SPACING.XLARGE};
  margin: ${CONTENT_SPACING.LARGE};

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const Home = () => {
  // todo Find a better home
  const { galleries } = getData()

  return (
    <HomeImageWrapper>
      {Object.values(galleries).map(
        ({ slug, title, previewSrc, previewId }) => (
          <GalleryPreview
            key={slug}
            slug={slug}
            title={title}
            previewSrc={previewSrc}
            previewId={previewId}
          />
        )
      )}
    </HomeImageWrapper>
  )
}

export default Home
