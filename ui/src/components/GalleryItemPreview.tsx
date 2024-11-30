import React from 'react'

import { Link } from 'react-router-dom'
import BlurImage from 'src/sharedComponents/BlurImage'
import usePhotoStore from 'src/store'
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
    <Link id={photo.id} to={`/gallery/${galleryId}/${photoId}`} key={photo.id}>
      <BlurImage alt={alt} blurHash={photo.blurHash} src={src} useSquareImage />
    </Link>
  )
}

export default GalleryItemPreview
