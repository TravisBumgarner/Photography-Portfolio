import React, { useCallback, useEffect } from 'react'
import styled from 'styled-components'

import { useNavigate, useParams } from 'react-router-dom'
import Error from 'src/sharedComponents/Error'
import IconButton from 'src/sharedComponents/IconButton'
import NavigationAnimation from 'src/sharedComponents/NavigationAnimation'
import usePhotoStore from 'src/store'
import { COLORS, CONTENT_SPACING, Z_INDEX } from 'src/theme'
import { getPhotoUrl } from 'src/utils'

const SinglePhoto = () => {
  const selectedPhotoIds = usePhotoStore(state => state.selectedPhotoIds)
  const getPhotoById = usePhotoStore(state => state.getPhotoById)
  const navigate = useNavigate()

  const { gallerySlug, photoSlug } = useParams<{
    gallerySlug: string
    photoSlug: string
  }>()

  const details = getPhotoById(photoSlug!) // todo fix

  const navigateToNextPhoto = useCallback(
    (direction: 'left' | 'right') => {
      if (!photoSlug) {
        navigate('/error404')
        return
      }

      const index = selectedPhotoIds.indexOf(photoSlug)

      let nextIndex: number
      if (direction === 'left') {
        if (index === 0) nextIndex = selectedPhotoIds.length - 1
        else nextIndex = index - 1
      } else {
        if (index === selectedPhotoIds.length - 1) nextIndex = 0
        else nextIndex = index + 1
      }

      const nextPhotoId = selectedPhotoIds[nextIndex]
      navigate(`/gallery/${gallerySlug}/${nextPhotoId}`)
    },
    [selectedPhotoIds, gallerySlug, navigate, photoSlug]
  )

  const preLoadNeighboringPhotos = useCallback(() => {
    if (!selectedPhotoIds || !photoSlug) return

    const index = selectedPhotoIds.indexOf(photoSlug)
    const previousIndex = index === 0 ? selectedPhotoIds.length - 1 : index - 1
    const nextIndex = index === selectedPhotoIds.length - 1 ? 0 : index + 1

    const previousPhoto = getPhotoById(selectedPhotoIds[previousIndex])
    const nextPhoto = getPhotoById(selectedPhotoIds[nextIndex])

    if (previousPhoto) {
      const img = new Image()
      img.src = getPhotoUrl({
        isThumbnail: false,
        photoSrc: previousPhoto.src
      })
    }

    if (nextPhoto) {
      const img = new Image()
      img.src = getPhotoUrl({
        isThumbnail: false,
        photoSrc: nextPhoto.src
      })
    }
  }, [selectedPhotoIds, getPhotoById, photoSlug])

  const returnToGallery = useCallback(() => {
    navigate(`/gallery/${gallerySlug}`)
  }, [gallerySlug, navigate])

  useEffect(() => {
    preLoadNeighboringPhotos()
  }, [preLoadNeighboringPhotos])

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') navigateToNextPhoto('left')
      if (event.key === 'ArrowRight') navigateToNextPhoto('right')
      if (event.key === 'Escape') returnToGallery()
    },
    [navigateToNextPhoto, returnToGallery]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  if (!details) return <Error value="404" />

  const photoSrc = getPhotoUrl({
    isThumbnail: false,
    photoSrc: details.src
  })

  return (
    <>
      <NavigationAnimation>
        <Wrapper>
          <PhotoWrapper>
            <StyledPhoto src={photoSrc} />
          </PhotoWrapper>
        </Wrapper>
      </NavigationAnimation>
      <ControlsWrapper>
        <IconButton
          color={COLORS.BACKGROUND}
          icon="arrowLeft"
          size="LARGE"
          ariaLabel="Previous photo"
          onClick={() => {
            navigateToNextPhoto('left')
          }}
        />
        <IconButton
          color={COLORS.BACKGROUND}
          icon="close"
          ariaLabel="Close single photo view"
          onClick={returnToGallery}
          size="LARGE"
        />
        <IconButton
          color={COLORS.BACKGROUND}
          icon="arrowRight"
          ariaLabel="Next photo"
          onClick={() => {
            navigateToNextPhoto('right')
          }}
          size="LARGE"
        />
      </ControlsWrapper>
    </>
  )
}

const Wrapper = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  z-index: ${Z_INDEX.SINGLE_PHOTO};
`

const ControlsWrapper = styled.div`
  position: fixed;
  right: 0;
  bottom: 0;
  background-color: color-mix(in srgb, ${COLORS.FOREGROUND} 50%, transparent);
  > button {
    padding: ${CONTENT_SPACING.MEDIUM};
  }
  border-radius: ${CONTENT_SPACING.MEDIUM};
  z-index: ${Z_INDEX.SINGLE_PHOTO_CONTROLS};
`

const PhotoWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: ${CONTENT_SPACING.LARGE};
`

const StyledPhoto = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  box-sizing: border-box;
  aspect-ratio: inherit;
  user-select: none;
`

export default SinglePhoto
