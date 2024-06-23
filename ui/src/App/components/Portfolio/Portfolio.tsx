import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { context } from '../../context';
import { Gallery, Photo } from './components';

const Portfolio = () => {
  const { state: { photos, galleries } } = useContext(context)
  const [filteredPhotoIds, setFilteredPhotoIds] = useState<string[]>([])
  const [selectedFilteredPhotoIndex, setSelectedFilteredPhotoIndex] = useState<number | undefined>(undefined);
  const [initialLoad, setInitialLoad] = useState(true) // Use for Initial Load of photo ID from URL
  const { gallerySlug, photoId } = useParams<{ gallerySlug: string, photoId: string }>();
  const navigate = useNavigate();

  const filterPhotoIds = useCallback(() => {
    const filteredPhotoIds = Object.values(photos)
      .filter(photo => photo.gallery == gallerySlug)
      .sort((a, b) => {
        const aDate = new Date(a.dateTaken)
        const bDate = new Date(b.dateTaken)
        return bDate.getTime() - aDate.getTime()
      })
      .map(({ id }) => id)
    return filteredPhotoIds
  }, [photos, gallerySlug])

  useEffect(() => {
    const filteredPhotoIds = filterPhotoIds()
    if (initialLoad && photoId && selectedFilteredPhotoIndex === undefined) {
      setSelectedFilteredPhotoIndex(filteredPhotoIds.indexOf(photoId))
      setInitialLoad(false)
    }
    setFilteredPhotoIds(filteredPhotoIds)
  }, [gallerySlug])

  const galleryDetails = galleries[gallerySlug]

  const handleUrlChange = useCallback(() => {
    if (initialLoad && photoId && selectedFilteredPhotoIndex === undefined) {
      return
    }
    navigate(
      `/${galleryDetails.slug}/${filteredPhotoIds[selectedFilteredPhotoIndex] || ''}`
    )
  }, [initialLoad, photoId, selectedFilteredPhotoIndex, galleryDetails]);

  useEffect(handleUrlChange, [selectedFilteredPhotoIndex])

  const onCloseCallback = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'auto' })
  }, [])

  return (
    <>
      <Gallery
        setSelectedFilteredPhotoIndex={setSelectedFilteredPhotoIndex}
        photos={photos}
        filteredPhotoIds={filteredPhotoIds}
        galleryDetails={galleryDetails}
        privateGallery={false}
      />
      <Photo
        setSelectedFilteredPhotoIndex={setSelectedFilteredPhotoIndex}
        selectedFilteredPhotoIndex={selectedFilteredPhotoIndex}
        photos={photos}
        filteredPhotoIds={filteredPhotoIds}
        onCloseCallback={onCloseCallback}
        privateGallery={false}
        gallerySlug={galleryDetails.slug}
      />
    </>
  )
}

export default Portfolio