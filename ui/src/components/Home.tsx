import React from 'react'
import styled from 'styled-components'

import { motion } from 'framer-motion'
import { NavigationAnimation } from 'src/sharedComponents'
import usePhotoStore from 'src/store'
import { CONTENT_SPACING, MOBILE_WIDTH } from 'src/theme'
import GalleryPreview from './GalleryPreview'

const Home = () => {
  const galleries = usePhotoStore(state => state.galleries)

  return (
    <NavigationAnimation>
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
    </NavigationAnimation>
  )
}

const HomeImageWrapper = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${CONTENT_SPACING.XLARGE};
  margin: ${CONTENT_SPACING.LARGE};

  @media (max-width: ${MOBILE_WIDTH}) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${CONTENT_SPACING.LARGE};
  }
`

export default Home
