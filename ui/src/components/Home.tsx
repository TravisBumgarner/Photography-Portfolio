import React, { useContext } from 'react'
import styled from 'styled-components'

import { context } from 'src/context'
import { CONTENT_SPACING, MOBILE_WIDTH } from 'src/theme'
import GalleryPreview from './GalleryPreview'
import { TITLE_BAR_HEIGHT_DESKTOP, TITLE_BAR_HEIGHT_MOBILE } from './TitleBar'

const HomeImageWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${CONTENT_SPACING.XLARGE};
  margin: calc(${CONTENT_SPACING.XXLARGE} + ${TITLE_BAR_HEIGHT_DESKTOP})
    ${CONTENT_SPACING.LARGE} ${CONTENT_SPACING.LARGE} ${CONTENT_SPACING.LARGE};

  @media (max-width: ${MOBILE_WIDTH}) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${CONTENT_SPACING.LARGE};
    margin: calc(${CONTENT_SPACING.XXLARGE} + ${TITLE_BAR_HEIGHT_MOBILE})
      ${CONTENT_SPACING.LARGE} ${CONTENT_SPACING.LARGE} ${CONTENT_SPACING.LARGE};
  }
`

const Home = () => {
  const {
    state: { galleries }
  } = useContext(context)

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
