import React, { useContext, useEffect, useState } from 'react'
import styled from 'styled-components'

import { Link, Navigate, useParams } from 'react-router-dom'
import { BlurImage, PageHeader } from 'sharedComponents'
import { CONTENT_SPACING } from 'theme'
import { type PhotoType, type PrivateGallery } from 'types'
import { context } from '../context'
import { getPhotoUrl } from '../utils'

interface Props {
  privateGallery: boolean
}

interface PhotoPreviewProps {
  photoId: string
  privateGallery: boolean
  gallerySlug: string
}

const PhotoPreview = ({
  photoId,
  privateGallery,
  gallerySlug
}: PhotoPreviewProps) => {
  const {
    state: { privateGalleries, photos }
  } = useContext(context)

  const photo = privateGallery
    ? privateGalleries[gallerySlug].photos[photoId]
    : photos[photoId]

  const src = getPhotoUrl({
    isThumbnail: true,
    photoSrc: photo.src,
    privateGalleryId: undefined
  })

  return (
    <Link id={photo.id} to={`/${gallerySlug}/${photoId}`} key={photo.id}>
      <BlurImage blurHash={photo.blurHash} src={src} useSquareImage />
    </Link>
  )
}

const getSelectedGalleryPhotoIdsByGalleryId = (
  galleryId: string,
  photos: PhotoType[]
) => {
  return Object.values(photos)
    .filter(photo => photo.galleryIds.includes(galleryId))
    .sort((a, b) => {
      const aDate = new Date(a.dateTaken)
      const bDate = new Date(b.dateTaken)
      return aDate.getTime() - bDate.getTime()
    })
    .map(({ id }) => id)
}

const getSelectedPrivateGalleryPhotoIdsByGalleryId = (
  galleryId: string,
  privateGalleries: Record<string, PrivateGallery>
) => {
  return Object.values(privateGalleries[galleryId].photos)
    .sort((a, b) => {
      const aDate = new Date(a.dateTaken)
      const bDate = new Date(b.dateTaken)
      return aDate.getTime() - bDate.getTime()
    })
    .map(({ id }) => id)
}

const Gallery = ({ privateGallery }: Props) => {
  const [selectedGalleryPhotoIds, setSelectedGalleryPhotoIds] = useState<
    string[]
  >([])

  const { gallerySlug } = useParams<{ gallerySlug: string }>()
  const {
    state: { galleries, photos, previouslySelectedPhotoId, privateGalleries },
    dispatch
  } = useContext(context)

  useEffect(() => {
    if (previouslySelectedPhotoId) {
      dispatch({
        type: 'BACK_TO_GALLERY',
        payload: {
          previouslySelectedPhotoId: null
        }
      })
    }
  }, [previouslySelectedPhotoId, dispatch])

  useEffect(() => {
    if (!gallerySlug) return

    let newPhotoIds: string[] = []
    if (!privateGallery) {
      newPhotoIds = getSelectedGalleryPhotoIdsByGalleryId(
        gallerySlug,
        Object.values(photos)
      )
    } else {
      newPhotoIds = getSelectedPrivateGalleryPhotoIdsByGalleryId(
        gallerySlug,
        privateGalleries
      )
    }
    setSelectedGalleryPhotoIds(newPhotoIds)
  }, [gallerySlug, photos, privateGalleries, privateGallery])

  if (!gallerySlug) {
    return <Navigate to="/" />
  }

  return (
    <>
      <ProjectDescriptionWrapper>
        <PageHeader>
          {privateGallery
            ? privateGalleries[gallerySlug].gallery.title
            : galleries[gallerySlug].title}
        </PageHeader>
      </ProjectDescriptionWrapper>
      <GalleryWrapper>
        {selectedGalleryPhotoIds.map(photoId => (
          <PhotoPreview
            key={photoId}
            photoId={photoId}
            privateGallery={privateGallery}
            gallerySlug={gallerySlug}
          />
        ))}
      </GalleryWrapper>
    </>
  )
}

const ProjectDescriptionWrapper = styled.div`
  margin: 1rem;
`

const GalleryWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${CONTENT_SPACING.XLARGE};
  margin: ${CONTENT_SPACING.LARGE};

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`

export default Gallery
