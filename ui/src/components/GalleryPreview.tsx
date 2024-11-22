import React from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { CONTENT_SPACING, FONT_SIZES } from 'theme'
import { BlurImage } from '../sharedComponents'
import { getPhotoUrl } from '../utils'
import { useData } from '../content/useData'

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
  // Todo better home.
  const { photos } = useData()

  const url = getPhotoUrl({
    isThumbnail: true,
    photoSrc: previewSrc,
    privateGalleryId: undefined
  })

  const { blurHash } = photos[previewId]

  return (
    <div>
      <StyledLink id={slug} to={`/${slug}`}>
        <Header>{title}</Header>
        <BlurImage useSquareImage src={url} blurHash={blurHash} />
      </StyledLink>
    </div>
  )
}

const StyledLink = styled(Link)`
  text-decoration: none;
  text-align: center;
  color: black;
`

const Header = styled.h2`
  font-weight: 700;
  margin-bottom: ${CONTENT_SPACING.MEDIUM};
  margin-top: ${CONTENT_SPACING.LARGE};
  font-size: ${FONT_SIZES.SMALL};
  text-align: left;
`

export default GalleryPreview
