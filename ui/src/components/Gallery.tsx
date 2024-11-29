import React, { useMemo } from 'react'
import styled from 'styled-components'

import { Navigate, useParams } from 'react-router-dom'
import { PageHeader } from 'src/sharedComponents'
import usePhotoStore from 'src/store'
import { CONTENT_SPACING, MOBILE_WIDTH } from 'src/theme'
import GalleryItemPreview from './GalleryItemPreview'

const Gallery = () => {
  // const [selectedPhotoIds, setSelectedPhotoIds] = useState<string[]>([])
  const getSelectedGalleryPhotoIdsByGalleryId = usePhotoStore(
    state => state.getSelectedGalleryPhotoIdsByGalleryId
  )
  const setSelectedGallery = usePhotoStore(state => state.setSelectedGallery)

  // const selectedPhotoId = usePhotoStore(state => state.selectedPhotoId)
  // const setSelectedPhotoId = usePhotoStore(state => state.setSelectedPhotoId)
  // const navigate = useNavigate()

  const galleries = usePhotoStore(state => state.galleries)
  // const photos = usePhotoStore(state => state.photos)

  const {
    gallerySlug
    // photoSlug
  } = useParams<{
    gallerySlug: string
    photoSlug?: string
  }>()

  const selectedPhotoIds = useMemo(() => {
    if (!gallerySlug) return []
    return getSelectedGalleryPhotoIdsByGalleryId()
  }, [gallerySlug, getSelectedGalleryPhotoIdsByGalleryId])

  setSelectedGallery({ id: gallerySlug ?? 'non' })

  console.log(getSelectedGalleryPhotoIdsByGalleryId())

  const galleryTitle = useMemo(() => {
    if (!gallerySlug) return ''

    return galleries[gallerySlug].title
  }, [gallerySlug, galleries])

  // Grab the photo id from the url and set it as the selectedPhotoId on first load.
  // useEffect(() => {
  //   if (photoSlug) {
  //     setSelectedPhotoId(photoSlug)
  //   }
  // }, [photoSlug, setSelectedPhotoId])

  // useEffect(() => {
  //   if (selectedPhotoId) {
  //     navigate(`/${gallerySlug}/${selectedPhotoId}`)
  //   } else {
  //     navigate(`/${gallerySlug}`)
  //   }
  // }, [selectedPhotoId, navigate, gallerySlug])

  // const navigateToNextPhoto = useCallback(
  //   (direction: 'left' | 'right') => {
  //     if (!selectedPhotoId) return

  //     const index = selectedPhotoIds.indexOf(selectedPhotoId)

  //     let nextIndex: number
  //     if (direction === 'left') {
  //       if (index === 0) nextIndex = selectedPhotoIds.length - 1
  //       else nextIndex = index - 1
  //     } else {
  //       if (index === selectedPhotoIds.length - 1) nextIndex = 0
  //       else nextIndex = index + 1
  //     }

  //     const nextPhotoId = selectedPhotoIds[nextIndex]
  //     setSelectedPhotoId(nextPhotoId)
  //   },
  //   [selectedPhotoId, selectedPhotoIds, setSelectedPhotoId]
  // )

  // const preLoadNeighboringPhotos = useCallback(() => {
  //   if (!selectedPhotoIds || !selectedPhotoId) return

  //   const index = selectedPhotoIds.indexOf(selectedPhotoId)
  //   const previousIndex = index === 0 ? selectedPhotoIds.length - 1 : index - 1
  //   const nextIndex = index === selectedPhotoIds.length - 1 ? 0 : index + 1

  //   const previousPhoto = photos[selectedPhotoIds[previousIndex]]
  //   const nextPhoto = photos[selectedPhotoIds[nextIndex]]

  //   if (previousPhoto) {
  //     const img = new Image()
  //     img.src = getPhotoUrl({
  //       isThumbnail: false,
  //       photoSrc: previousPhoto.src
  //     })
  //   }

  //   if (nextPhoto) {
  //     const img = new Image()
  //     img.src = getPhotoUrl({
  //       isThumbnail: false,
  //       photoSrc: nextPhoto.src
  //     })
  //   }
  // }, [selectedPhotoIds, selectedPhotoId, photos, gallerySlug])

  // useEffect(() => {
  //   preLoadNeighboringPhotos()
  // }, [preLoadNeighboringPhotos])

  // const handleCloseModal = useCallback(() => {
  //   if (selectedPhotoId) {
  //     const previousFocusedPhoto = document.getElementById(selectedPhotoId)
  //     if (!previousFocusedPhoto) return

  //     previousFocusedPhoto.scrollIntoView({
  //       behavior: 'auto',
  //       block: 'center',
  //       inline: 'center'
  //     })
  //     previousFocusedPhoto.focus()
  //     // Without the timeout the photo doesn't have a chance to focus before blurring causing
  //     // tab index to remain on the photo that was selected when the PhotoModal was first openned.
  //     setTimeout(() => {
  //       previousFocusedPhoto.blur()
  //     }, 0)
  //   }

  //   setSelectedPhotoId(null)
  // }, [setSelectedPhotoId, selectedPhotoId])

  if (!gallerySlug) {
    return <Navigate to="/" />
  }

  return (
    <>
      {/* <PhotoModal
        closeModal={handleCloseModal}
        navigateToNextPhoto={navigateToNextPhoto}
        selectedPhotoId={selectedPhotoId}
      /> */}
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
