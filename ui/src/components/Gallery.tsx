import React, { useCallback, useContext, useEffect, useState } from 'react'
import styled from 'styled-components'

import { Navigate, useParams } from 'react-router-dom'
import { BlurImage, PageHeader } from 'sharedComponents'
import { CONTENT_SPACING } from 'theme'
import { type PhotoType, type PrivateGallery } from 'types'
import { context } from '../context'
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

  const handleClick = useCallback(() => {
    updateSelectedPhotoId(photoId)
  }, [photoId, updateSelectedPhotoId])

  return (
    // TODO - change div.
    <div onClick={handleClick} key={photo.id}>
      <BlurImage blurHash={photo.blurHash} src={src} useSquareImage />
    </div>
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
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([])
  const [selectedPhotoId, setSelectedPhotoId] = useState<string | null>(null)

  const { gallerySlug, photoSlug } = useParams<{
    gallerySlug: string
    photoSlug?: string
  }>()
  const {
    state: {
      galleries,
      photos,
      // previouslySelectedPhotoId,
      privateGalleries
    }
    // dispatch
  } = useContext(context)

  // useEffect(() => {
  //   if (previouslySelectedPhotoId) {
  //     dispatch({
  //       type: 'BACK_TO_GALLERY',
  //       payload: {
  //         previouslySelectedPhotoId: null
  //       }
  //     })
  //   }
  // }, [previouslySelectedPhotoId, dispatch])

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
    setSelectedPhotoIds(newPhotoIds)
  }, [gallerySlug, photos, privateGalleries, privateGallery])

  const updateSelectedPhotoId = useCallback(
    (photoId: string) => {
      setSelectedPhotoId(photoId)
    },
    [setSelectedPhotoId]
  )

  const navigateToNextPhoto = useCallback(
    (direction: 'left' | 'right') => {
      // if (!photoSlug || !selectedGalleryPhotoIds) {
      //   navigate('/')
      //   return
      // }

      // No photo is selected so don't continue.
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
      // // Improve back button so that it goes back to gallery instead of previous photo.
      // navigate(`/${gallerySlug}/${nextPhotoId}`, { replace: true })
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
        isOpen={selectedPhotoId !== null}
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
