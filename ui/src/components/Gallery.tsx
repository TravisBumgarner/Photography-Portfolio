import React, { useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import PageHeader from 'src/sharedComponents/PageHeader'
import usePhotoStore from 'src/store'
import { CONTENT_SPACING, MOBILE_WIDTH } from 'src/theme'
import GalleryItemPreview from './GalleryItemPreview'

const Gallery = () => {
  const setSelectedPhotoIds = usePhotoStore(state => state.setSelectedPhotoIds)
  const selectedPhotoIds = usePhotoStore(state => state.selectedPhotoIds)
  const galleries = usePhotoStore(state => state.galleries)
  const [searchParams, setSearchParams] = useSearchParams()
  const previouslyOpenPhotoId = searchParams.get('previouslyOpenPhotoId')

  useEffect(() => {
    if (previouslyOpenPhotoId) {
      document.getElementById(previouslyOpenPhotoId)?.scrollIntoView({
        block: 'center',
        inline: 'center'
      })
      setSearchParams({})
    }
  }, [previouslyOpenPhotoId, setSearchParams])

  const { gallerySlug } = useParams<{
    gallerySlug: string
  }>()

  useEffect(() => {
    setSelectedPhotoIds(gallerySlug)
  }, [gallerySlug, setSelectedPhotoIds])

  const galleryTitle = useMemo(() => {
    if (!gallerySlug) return ''

    const gallery = galleries[gallerySlug]
    return gallery?.title || ''
  }, [gallerySlug, galleries])

  if (!gallerySlug || !galleries[gallerySlug]) {
    return <Navigate to="/" />
  }

  return (
    <>
      <ProjectDescriptionWrapper>
        <PageHeader>{galleryTitle}</PageHeader>
      </ProjectDescriptionWrapper>
      <GalleryWrapper>
        {selectedPhotoIds.map(photoId => (
          <GalleryItemPreview
            alt={`photo of ${galleryTitle}`}
            key={photoId}
            photoId={photoId}
            galleryId={gallerySlug}
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
