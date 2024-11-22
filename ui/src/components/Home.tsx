import React from 'react'
import styled from 'styled-components'

import { CONTENT_SPACING } from 'theme'
import GalleryPreview from './GalleryPreview'
import { useData } from '../content/useData'

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
  const { galleries } = useData()

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
