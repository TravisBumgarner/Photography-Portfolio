import React from 'react'
import { Link } from 'react-router-dom'
import BlurImage from 'src/sharedComponents/BlurImage'
import usePhotoStore from 'src/store'
import { COLORS, CONTENT_SPACING, FONT_SIZES, MOBILE_WIDTH } from 'src/theme'
import styled from 'styled-components'
import { getPhotoUrl } from '../utils'

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
  const photos = usePhotoStore(state => state.photos)

  const url = getPhotoUrl({
    isThumbnail: true,
    photoSrc: previewSrc
  })

  const { blurHash } = photos[previewId]

  return (
    <Container>
      <StyledLink id={slug} to={`/gallery/${slug}`}>
        <BlurImage alt={title} useSquareImage src={url} blurHash={blurHash} />
        <Header>{title}</Header>
      </StyledLink>
    </Container>
  )
}

const Header = styled.h2`
  font-weight: 700;
  margin-bottom: ${CONTENT_SPACING.MEDIUM};
  margin-top: ${CONTENT_SPACING.LARGE};
  font-size: ${FONT_SIZES.SMALL};
  text-align: left;
  transition: color 0.2s ease;

  @media (max-width: ${MOBILE_WIDTH}) {
    margin-top: ${CONTENT_SPACING.MEDIUM};
    margin-bottom: ${CONTENT_SPACING.SMALL};
  }
`

const StyledLink = styled(Link)`
  text-decoration: none;
  text-align: center;
  color: ${COLORS.BACKGROUND};

  @media (hover: hover) {
    &:hover ${Header} {
      color: ${COLORS.PRIMARY};
    }
  }
`

const Container = styled.div`
  @media (hover: hover) {
    &:hover ${Header} {
      color: ${COLORS.PRIMARY};
    }

    &:hover img {
      transform: scale(1.05);
      box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2),
        0 6px 20px 0 rgba(0, 0, 0, 0.19);
    }
  }
`

export default GalleryPreview
