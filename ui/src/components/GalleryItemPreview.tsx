import React, { useCallback } from 'react'
import styled from 'styled-components'

import { BlurImage } from 'src/sharedComponents'
import usePhotoStore from 'src/store'
import { getPhotoUrl } from '../utils'

const Button = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: inline-block;

  @media (hover: hover) {
    > img:hover {
      transform: scale(1.03);
    }
  }
`

interface PhotoPreviewProps {
  photoId: string
  alt: string
}

const GalleryItemPreview = ({ photoId, alt }: PhotoPreviewProps) => {
  const photos = usePhotoStore(state => state.photos)
  const setSelectedPhotoId = usePhotoStore(state => state.setSelectedPhotoId)

  const photo = photos[photoId]

  const src = getPhotoUrl({
    isThumbnail: true,
    photoSrc: photo.src
  })

  const handleClick = useCallback(() => {
    setSelectedPhotoId(photoId)
  }, [photoId, setSelectedPhotoId])

  return (
    <Button id={photo.id} onClick={handleClick} key={photo.id}>
      <BlurImage alt={alt} blurHash={photo.blurHash} src={src} useSquareImage />
    </Button>
  )
}

export default GalleryItemPreview
