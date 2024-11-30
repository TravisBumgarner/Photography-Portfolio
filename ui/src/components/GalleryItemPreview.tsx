import React from 'react'

import { Link } from 'react-router-dom'
import BlurImage from 'src/sharedComponents/BlurImage'
import usePhotoStore from 'src/store'
import styled from 'styled-components'
import { getPhotoUrl } from '../utils'

interface PhotoPreviewProps {
  photoId: string
  alt: string
  galleryId: string
}

const GalleryItemPreview = ({ photoId, alt, galleryId }: PhotoPreviewProps) => {
  const photos = usePhotoStore(state => state.photos)

  const photo = photos[photoId]

  const src = getPhotoUrl({
    isThumbnail: true,
    photoSrc: photo.src
  })

  return (
    <StyledLink
      id={photo.id}
      to={`/gallery/${galleryId}/${photoId}`}
      key={photo.id}
    >
      <BlurImage alt={alt} blurHash={photo.blurHash} src={src} useSquareImage />
    </StyledLink>
  )
}

const StyledLink = styled(Link)`
  &:hover img {
    transform: scale(1.05);
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  }
`

export default GalleryItemPreview
