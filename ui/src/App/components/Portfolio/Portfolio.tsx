import React, { Dispatch, SetStateAction, useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom';
import Modal from 'react-modal';

import { GalleryType, PhotoType } from 'types'
import { Gallery, Photo } from './components'

type Props = {
  photos: { [id: string]: PhotoType },
  galleries: Record<string, GalleryType>,
  setIsTitlebarVisible: Dispatch<SetStateAction<boolean>>
}

const Portfolio = ({ photos, galleries, setIsTitlebarVisible }: Props
) => {
  const [filteredPhotoIds, setFilteredPhotoIds] = useState<string[]>([])
  const [selectedFilteredPhotoIndex, setSelectedFilteredPhotoIndex] = useState<number | undefined>(undefined);
  const [initialLoad, setInitialLoad] = useState(true) // Use for Initial Load of photo ID from URL
  const { gallerySlug, photoId } = useParams<{ gallerySlug: string, photoId: string }>();
  const navigate = useNavigate();

  useEffect(() => setIsTitlebarVisible(selectedFilteredPhotoIndex === undefined), [selectedFilteredPhotoIndex])

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

  return (
    <>
      <Gallery
        setSelectedFilteredPhotoIndex={setSelectedFilteredPhotoIndex}
        photos={photos}
        filteredPhotoIds={filteredPhotoIds}
        galleryDetails={galleryDetails}
      />
      <Photo
        setSelectedFilteredPhotoIndex={setSelectedFilteredPhotoIndex}
        selectedFilteredPhotoIndex={selectedFilteredPhotoIndex}
        photos={photos}
        filteredPhotoIds={filteredPhotoIds} 
        />
    </>
  )
}

export default Portfolio