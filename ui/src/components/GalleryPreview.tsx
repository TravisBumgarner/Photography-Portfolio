import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { COLORS, CONTENT_SPACING, FONT_SIZES } from 'theme'
import { context } from '../context'
import { BlurImage } from '../sharedComponents'
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
  const {
    state: { photos }
  } = useContext(context)

  const url = getPhotoUrl({
    isThumbnail: true,
    photoSrc: previewSrc,
    privateGalleryId: undefined
  })

  const { blurHash } = photos[previewId]

  return (
    <div>
      <StyledLink id={slug} to={`/${slug}`}>
        <BlurImage alt={title} useSquareImage src={url} blurHash={blurHash} />
        <Header>{title}</Header>
      </StyledLink>
    </div>
  )
}

const Header = styled.h2`
  font-weight: 700;
  margin-bottom: ${CONTENT_SPACING.MEDIUM};
  margin-top: ${CONTENT_SPACING.LARGE};
  font-size: ${FONT_SIZES.SMALL};
  text-align: left;
  transition: color 0.2s ease;
`

const StyledLink = styled(Link)`
  text-decoration: none;
  text-align: center;
  color: ${COLORS.BACKGROUND};

  &:hover ${Header} {
    color: ${COLORS.PRIMARY};
  }
`

export default GalleryPreview
