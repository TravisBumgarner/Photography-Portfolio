import React, { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

import { Navigate, useParams } from 'react-router-dom'
import { PageHeader } from 'src/sharedComponents'
import usePhotoStore from 'src/store'
import { CONTENT_SPACING, MOBILE_WIDTH } from 'src/theme'
import GalleryItemPreview from './GalleryItemPreview'
import PhotoModal from './PhotoModal'

const Gallery = () => {
  const setSelectedPhotoIds = usePhotoStore(state => state.setSelectedPhotoIds)
  const selectedPhotoIds = usePhotoStore(state => state.selectedPhotoIds)
  const setSelectedPhotoId = usePhotoStore(state => state.setSelectedPhotoId)
  const [onlyFetchOnLoad, setOnlyFetchOnLoad] = useState(false)
  const galleries = usePhotoStore(state => state.galleries)

  const { gallerySlug, photoSlug } = useParams<{
    gallerySlug: string
    photoSlug?: string
  }>()

  useEffect(() => {
    setSelectedPhotoIds(gallerySlug)
  }, [gallerySlug, setSelectedPhotoIds])

  const galleryTitle = useMemo(() => {
    if (!gallerySlug) return ''

    const gallery = galleries[gallerySlug]
    return gallery?.title || ''
  }, [gallerySlug, galleries])

  // Grab the photo id from the url on load and set it as the selectedPhotoId on first load.
  useEffect(() => {
    if (photoSlug && !onlyFetchOnLoad) {
      setSelectedPhotoId(photoSlug)
      setOnlyFetchOnLoad(true)
    }
  }, [photoSlug, setSelectedPhotoId, onlyFetchOnLoad])

  const closeModalCallback = useCallback(
    (previouslySelectedPhotoId: string | null) => {
      if (!previouslySelectedPhotoId) return
      const previousFocusedPhoto = document.getElementById(
        previouslySelectedPhotoId
      )
      if (!previousFocusedPhoto) return

      previousFocusedPhoto.scrollIntoView({
        behavior: 'auto',
        block: 'center',
        inline: 'center'
      })
      previousFocusedPhoto.focus()
      // Without the timeout the photo doesn't have a chance to focus before blurring causing
      // tab index to remain on the photo that was selected when the PhotoModal was first openned.
      setTimeout(() => {
        previousFocusedPhoto.blur()
      }, 0)
    },
    []
  )

  if (!gallerySlug || !galleries[gallerySlug]) {
    return <Navigate to="/" />
  }

  return (
    <>
      <PhotoModal closeModalCallback={closeModalCallback} />
      <ProjectDescriptionWrapper>
        <PageHeader>{galleryTitle}</PageHeader>
      </ProjectDescriptionWrapper>
      <GalleryWrapper>
        {selectedPhotoIds.map(photoId => (
          <GalleryItemPreview
            alt={`photo of ${galleryTitle}`}
            key={photoId}
            photoId={photoId}
            // gallerySlug={gallerySlug}
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

  @media (max-width: ${MOBILE_WIDTH}) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${CONTENT_SPACING.LARGE};
  }
`

export default Gallery
