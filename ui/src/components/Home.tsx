import React, { useContext } from 'react'
import styled from 'styled-components'

import { Link } from 'react-router-dom'
import { CONTENT_SPACING, FONT_SIZES } from 'theme'
import { context } from '../context'
import { BlurImage } from '../sharedComponents'
import { getPhotoUrl } from '../utils'

const HomeImageWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${CONTENT_SPACING.XLARGE};
  margin: ${CONTENT_SPACING.LARGE};

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

const GalleryPreview = ({
  slug,
  title,
  previewSrc,
  previewId
}: {
  slug: string
  title: string
  previewSrc: string
  previewId: string
}) => {
  const {
    state: { photos }
  } = useContext(context)

  const url = getPhotoUrl({
    isThumbnail: true,
    photoSrc: previewSrc,
    privateGalleryId: undefined
  })

  const { blurHash, aspectRatio } = photos[previewId]

  return (
    <div>
      <Link
        style={{
          textDecoration: 'none',
          textAlign: 'center',
          color: 'black'
        }}
        id={slug}
        to={`/${slug}`}
      >
        <BlurImage
          useSquareImage
          src={url}
          blurHash={blurHash}
          aspectRatio={aspectRatio}
        />
        <Header>{title}</Header>
      </Link>
    </div>
  )
}

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

const Header = styled.h2`
  font-weight: 700;
  margin-bottom: ${CONTENT_SPACING.MEDIUM};
  margin-top: ${CONTENT_SPACING.LARGE};
  font-size: ${FONT_SIZES.SMALL};
  text-align: left;
`

export default Home
