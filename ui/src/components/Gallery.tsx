import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Navigate, useParams } from 'react-router-dom'
import NavigationAnimation from 'src/sharedComponents/NavigationAnimation'
import PageHeader from 'src/sharedComponents/PageHeader'
import usePhotoStore from 'src/store'
import { CONTENT_SPACING, MOBILE_WIDTH } from 'src/theme'
import styled from 'styled-components'
import GalleryItemPreview from './GalleryItemPreview'

const Gallery = () => {
  const setSelectedPhotoIds = usePhotoStore(state => state.setSelectedPhotoIds)
  const selectedPhotoIds = usePhotoStore(state => state.selectedPhotoIds)
  const galleries = usePhotoStore(state => state.galleries)
  const [thumbnailsLoadingCount, setThumbnailsLoadingCount] = useState(0)
  const [thumbnailsLoadedCount, setThumbnailsLoadedCount] = useState(0)
  const largeImageLoadQueue = useRef<string[]>([])

  const { gallerySlug } = useParams<{
    gallerySlug: string
  }>()

  const thumbnailsLoading = thumbnailsLoadingCount !== thumbnailsLoadedCount

  const loadLargeImage = useCallback((thumbnailAbsoluteUrl: string) => {
    const largeAbsoluteUrl = thumbnailAbsoluteUrl.replace('thumbnail', 'large')
    console.log('\tloading large image')
    const img = new Image()
    img.src = largeAbsoluteUrl
  }, [])

  const loadLargeImages = useCallback(() => {
    while (largeImageLoadQueue.current.length > 0) {
      const thumbnailAbsoluteUrl = largeImageLoadQueue.current.shift()
      if (!thumbnailAbsoluteUrl) return
      loadLargeImage(thumbnailAbsoluteUrl)
    }
  }, [loadLargeImage])

  useEffect(() => {
    if (thumbnailsLoading) return
    loadLargeImages()
  }, [thumbnailsLoading, loadLargeImages])

  const updateLoadedThumbnails = useCallback((thumbnailId: string) => {
    setThumbnailsLoadedCount(prev => prev + 1)
    largeImageLoadQueue.current.push(thumbnailId)
  }, [])

  const updateLoadingCount = useCallback(() => {
    setThumbnailsLoadingCount(prev => prev + 1)
  }, [])

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
    <NavigationAnimation>
      <PageHeader>{galleryTitle}</PageHeader>
      <GalleryWrapper>
        {selectedPhotoIds.map(photoId => (
          <GalleryItemPreview
            alt={`photo of ${galleryTitle}`}
            key={photoId}
            photoId={photoId}
            galleryId={gallerySlug}
            updateLoadedThumbnails={updateLoadedThumbnails}
            updateLoadingCount={updateLoadingCount}
          />
        ))}
      </GalleryWrapper>
    </NavigationAnimation>
  )
}

const GalleryWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${CONTENT_SPACING.XLARGE};

  @media (max-width: ${MOBILE_WIDTH}) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${CONTENT_SPACING.LARGE};
  }
`

export default Gallery
