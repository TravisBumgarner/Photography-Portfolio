import React, { useCallback, useContext, useEffect, useState } from 'react'
import styled from 'styled-components'

import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { BlurImage, PageHeader } from 'sharedComponents'
import { CONTENT_SPACING } from 'theme'
import { type PhotoType, type PrivateGallery } from 'types'
import { context } from '../context'
import { getPhotoUrl } from '../utils'
import PhotoModal from './PhotoModal'

interface Props {
  privateGallery: boolean
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
    state: { photos, privateGalleries }
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

  const navigate = useNavigate()

  const {
    state: { galleries, photos, privateGalleries }
  } = useContext(context)

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
    if (selectedPhotoId) {
      navigate(`/${gallerySlug}/${selectedPhotoId}`)
    } else {
      navigate(`/${gallerySlug}`)
    }
  }, [selectedPhotoId, navigate, gallerySlug])

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
