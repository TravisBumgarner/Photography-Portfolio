import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom';

import { Gallery, Photo } from './Portfolio/components'
import { GalleryType, PhotoType } from 'types';

type Data = {
  photos: Record<string, PhotoType>;
  galleries: Record<string, GalleryType>;
};


const PRIVATE_GALLERIES: Data = {
  galleries: {
    "abc123": {
      "title": "abc 123",
      "slug": "abc123"
    },
  },
  photos: {
    "3522ef02-6e11-52e2-b261-a3d6846adf74": {
      "id": "3522ef02-6e11-52e2-b261-a3d6846adf74",
      "src": "Screenshot%202024-06-15%20at%204.57.58%E2%80%AFPM.png",
      "location": "Mexico",
      "gallery": "abc123",
      "camera": "Sony RX100",
      "lens": "10.4-37.1 mm f/1.8-4.9",
      "iso": "ISO 400",
      "shutterSpeed": "1/200s",
      "aperture": "ƒ/7.1",
      "isBackgroundPhoto": false,
      "focalLength": "10.4mm",
      "dateTaken": "2015-10-20T19:39:30.000Z"
    },
    "66d88224-daf7-5377-b5d6-b3b3cd470a4e": {
      "id": "66d88224-daf7-5377-b5d6-b3b3cd470a4e",
      "src": "DSC01416.jpg",
      "location": "Mexico",
      "gallery": "2x3x4",
      "camera": "Sony RX100",
      "lens": "10.4-37.1 mm f/1.8-4.9",
      "iso": "ISO 125",
      "shutterSpeed": "1/50s",
      "aperture": "ƒ/8.0",
      "isBackgroundPhoto": false,
      "focalLength": "12.18mm",
      "dateTaken": "2015-10-20T19:41:49.000Z"
    },
    "eb0be00a-8fc4-5ecd-bbd8-b420dbbd3877": {
      "id": "eb0be00a-8fc4-5ecd-bbd8-b420dbbd3877",
      "src": "DSC01428.jpg",
      "location": "Mexico",
      "gallery": "abc123",
      "camera": "Sony RX100",
      "lens": "10.4-37.1 mm f/1.8-4.9",
      "iso": "ISO 400",
      "shutterSpeed": "1/640s",
      "aperture": "ƒ/6.3",
      "isBackgroundPhoto": false,
      "focalLength": "10.4mm",
      "dateTaken": "2015-10-20T20:01:02.000Z"
    },
    "35d2f162-6ad9-539f-a9ee-ae4a088a8104": {
      "id": "35d2f162-6ad9-539f-a9ee-ae4a088a8104",
      "src": "DSC01431.jpg",
      "location": "Mexico",
      "gallery": "abc123",
      "camera": "Sony RX100",
      "lens": "10.4-37.1 mm f/1.8-4.9",
      "iso": "ISO 400",
      "shutterSpeed": "1/320s",
      "aperture": "ƒ/6.3",
      "isBackgroundPhoto": false,
      "focalLength": "10.4mm",
      "dateTaken": "2015-10-20T20:10:41.000Z"
    },
    "d31ccf96-c574-50d5-826d-63a503aaaf25": {
      "id": "d31ccf96-c574-50d5-826d-63a503aaaf25",
      "src": "DSC01437.jpg",
      "location": "Mexico",
      "gallery": "abc123",
      "camera": "Sony RX100",
      "lens": "10.4-37.1 mm f/1.8-4.9",
      "iso": "ISO 400",
      "shutterSpeed": "1/250s",
      "aperture": "ƒ/6.3",
      "isBackgroundPhoto": false,
      "focalLength": "10.4mm",
      "dateTaken": "2015-10-21T19:53:10.000Z"
    },
  }
}

const Portfolio = () => {
  const [filteredPhotoIds, setFilteredPhotoIds] = useState<string[]>([])
  const [selectedFilteredPhotoIndex, setSelectedFilteredPhotoIndex] = useState<number | undefined>(undefined);
  const [initialLoad, setInitialLoad] = useState(true) // Use for Initial Load of photo ID from URL
  const { privateGallerySlug, photoId } = useParams<{ privateGallerySlug: string, photoId: string }>();
  const navigate = useNavigate();

  const photos = PRIVATE_GALLERIES['photos']
  const galleryDetails = PRIVATE_GALLERIES.galleries[privateGallerySlug]

  const filterPhotoIds = useCallback(() => {
    const filteredPhotoIds = Object.values(PRIVATE_GALLERIES.photos)
      .filter(photo => photo.gallery == privateGallerySlug)
      .sort((a, b) => {
        const aDate = new Date(a.dateTaken)
        const bDate = new Date(b.dateTaken)
        return bDate.getTime() - aDate.getTime()
      })
      .map(({ id }) => id)
    return filteredPhotoIds
  }, [photos, privateGallerySlug])

  useEffect(() => {
    const filteredPhotoIds = filterPhotoIds()
    if (initialLoad && photoId && selectedFilteredPhotoIndex === undefined) {
      setSelectedFilteredPhotoIndex(filteredPhotoIds.indexOf(photoId))
      setInitialLoad(false)
    }
    setFilteredPhotoIds(filteredPhotoIds)
  }, [privateGallerySlug])

  const handleUrlChange = useCallback(() => {
    if (initialLoad && photoId && selectedFilteredPhotoIndex === undefined) {
      return
    }
    navigate(
      `/private/${privateGallerySlug}/${filteredPhotoIds[selectedFilteredPhotoIndex] || ''}`
    )
  }, [initialLoad, photoId, selectedFilteredPhotoIndex, privateGallerySlug]);

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
      />
      <Photo
        setSelectedFilteredPhotoIndex={setSelectedFilteredPhotoIndex}
        selectedFilteredPhotoIndex={selectedFilteredPhotoIndex}
        photos={photos}
        filteredPhotoIds={filteredPhotoIds}
        onCloseCallback={onCloseCallback}
        downloadingEnabled={true}
      />
    </>
  )
}

export default Portfolio