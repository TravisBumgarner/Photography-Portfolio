import React, { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'

import { Navigate, useParams } from 'react-router-dom'
import { BlurImage, PageHeader } from 'sharedComponents'
import { CONTENT_SPACING } from 'theme'
import {
  getData,
  getSelectedGalleryPhotoIdsByGalleryId,
  getSelectedPrivateGalleryPhotoIdsByGalleryId
} from '../content'
import { getPhotoUrl } from '../utils'
import PhotoModal from './PhotoModal'

interface Props {
  privateGallery: boolean
}

interface PhotoPreviewProps {
  photoId: string
  privateGallery: boolean
  gallerySlug: string
  updateSelectedPhotoId: (photoId: string) => void
}

const PhotoPreview = ({
  photoId,
  privateGallery,
  gallerySlug,
  updateSelectedPhotoId
}: PhotoPreviewProps) => {
  // Find a better home.
  const { photos, privateGalleries } = getData()

  const photo = privateGallery
    ? privateGalleries[gallerySlug].photos[photoId]
    : photos[photoId]

  const src = getPhotoUrl({
    isThumbnail: true,
    photoSrc: photo.src,
    privateGalleryId: undefined
  })

  const handleClick = useCallback(() => {
    updateSelectedPhotoId(photoId)
  }, [photoId, updateSelectedPhotoId])

  return (
    <Button onClick={handleClick} key={photo.id}>
      <BlurImage blurHash={photo.blurHash} src={src} useSquareImage />
    </Button>
  )
}

const Button = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  display: inline-block;
`

const Gallery = ({ privateGallery }: Props) => {
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([])
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null)

  // Todo - find better home
  const { photos, galleries, privateGalleries } = getData()

  const { gallerySlug, photoSlug } = useParams<{
    gallerySlug: string
    photoSlug?: string
  }>()

  useEffect(() => {
    if (photoSlug) {
      console.log('I should only fire on first page load.')
      setSelectedPhotoId(photoSlug)
    }
  }, [photoSlug])

  useEffect(() => {
    if (!gallerySlug) return

    let newPhotoIds: string[] = []
    if (!privateGallery) {
      newPhotoIds = getSelectedGalleryPhotoIdsByGalleryId(gallerySlug)
    } else {
      newPhotoIds = getSelectedPrivateGalleryPhotoIdsByGalleryId(gallerySlug)
    }
    setSelectedPhotoIds(newPhotoIds)
  }, [gallerySlug, privateGallery])

  const updateSelectedPhotoId = useCallback(
    (photoId: string) => {
      setSelectedPhotoId(photoId)
    },
    [setSelectedPhotoId]
  )

  const navigateToNextPhoto = useCallback(
    (direction: 'left' | 'right') => {
      if (!selectedPhotoId) return

      const index = selectedPhotoIds.indexOf(selectedPhotoId)

      let nextIndex: number
      if (direction === 'left') {
        if (index === 0) nextIndex = selectedPhotoIds.length - 1
        else nextIndex = index - 1
      } else {
        if (index === selectedPhotoIds.length - 1) nextIndex = 0
        else nextIndex = index + 1
      }

      const nextPhotoId = selectedPhotoIds[nextIndex]
      setSelectedPhotoId(nextPhotoId)
    },
    [selectedPhotoId, selectedPhotoIds, setSelectedPhotoId]
  )

  const preLoadNeighboringPhotos = useCallback(() => {
    if (!selectedPhotoIds || !selectedPhotoId) return

    const index = selectedPhotoIds.indexOf(selectedPhotoId)
    const previousIndex = index === 0 ? selectedPhotoIds.length - 1 : index - 1
    const nextIndex = index === selectedPhotoIds.length - 1 ? 0 : index + 1

    const previousPhoto = photos[selectedPhotoIds[previousIndex]]
    const nextPhoto = photos[selectedPhotoIds[nextIndex]]

    if (previousPhoto) {
      const img = new Image()
      img.src = getPhotoUrl({
        isThumbnail: false,
        privateGalleryId: privateGallery ? gallerySlug : undefined,
        photoSrc: previousPhoto.src
      })
    }

    if (nextPhoto) {
      const img = new Image()
      img.src = getPhotoUrl({
        isThumbnail: false,
        privateGalleryId: privateGallery ? gallerySlug : undefined,
        photoSrc: nextPhoto.src
      })
    }
  }, [selectedPhotoIds, selectedPhotoId, photos, gallerySlug, privateGallery])

  useEffect(() => {
    preLoadNeighboringPhotos()
  }, [preLoadNeighboringPhotos])

  const handleCloseModal = useCallback(() => {
    setSelectedPhotoId(null)
  }, [setSelectedPhotoId])

  if (!gallerySlug) {
    return <Navigate to="/" />
  }
  console.log('doot', selectedPhotoId)
  return (
    <>
      <PhotoModal
        closeModal={handleCloseModal}
        privateGallery={privateGallery}
        navigateToNextPhoto={navigateToNextPhoto}
        selectedPhotoId={selectedPhotoId}
      />
      <ProjectDescriptionWrapper>
        <PageHeader>
          {privateGallery
            ? privateGalleries[gallerySlug].gallery.title
            : galleries[gallerySlug].title}
        </PageHeader>
      </ProjectDescriptionWrapper>
      <GalleryWrapper>
        {selectedPhotoIds.map(photoId => (
          <PhotoPreview
            key={photoId}
            photoId={photoId}
            privateGallery={privateGallery}
            gallerySlug={gallerySlug}
            updateSelectedPhotoId={updateSelectedPhotoId}
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
