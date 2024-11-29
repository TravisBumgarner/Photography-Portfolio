import React, { useCallback, useEffect } from 'react'
import Modal from 'react-modal'
import styled, { createGlobalStyle } from 'styled-components'

import { useNavigate, useParams } from 'react-router-dom'
import usePreventAppScroll from 'src/hooks/usePreventAppScroll'
import { IconButton } from 'src/sharedComponents'
import usePhotoStore from 'src/store'
import { COLORS, CONTENT_SPACING, MAX_WIDTH } from 'src/theme'
import { getPhotoUrl } from 'src/utils'

interface PhotoProps {
  closeModalCallback: (previouslySelectedPhotoId: string | null) => void
}

const PhotoModal = ({ closeModalCallback }: PhotoProps) => {
  const selectedPhotoIds = usePhotoStore(state => state.selectedPhotoIds)
  const getPhotoById = usePhotoStore(state => state.getPhotoById)
  const setSelectedPhotoId = usePhotoStore(state => state.setSelectedPhotoId)
  const selectedPhotoId = usePhotoStore(state => state.selectedPhotoId)
  const navigate = useNavigate()

  const { gallerySlug } = useParams<{
    gallerySlug: string
  }>()

  usePreventAppScroll(selectedPhotoId !== null)

  const details = getPhotoById(selectedPhotoId)

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

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') navigateToNextPhoto('left')
      if (event.key === 'ArrowRight') navigateToNextPhoto('right')
    },
    [navigateToNextPhoto]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [handleKeyPress])

  const preLoadNeighboringPhotos = useCallback(() => {
    if (!selectedPhotoIds || !selectedPhotoId) return

    const index = selectedPhotoIds.indexOf(selectedPhotoId)
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
  }, [selectedPhotoIds, selectedPhotoId, getPhotoById])

  const handleCloseModal = useCallback(() => {
    closeModalCallback(selectedPhotoId)

    navigate(`/${gallerySlug}`, { replace: true })

    setSelectedPhotoId(null)
  }, [
    closeModalCallback,
    selectedPhotoId,
    navigate,
    gallerySlug,
    setSelectedPhotoId
  ])

  useEffect(() => {
    if (selectedPhotoId) {
      // Prevent unneccesary re-renders which was caused with useNavigate
      const newUrl = `/${gallerySlug}/${selectedPhotoId}`
      window.history.replaceState(null, '', newUrl)
    }
  }, [selectedPhotoId, gallerySlug])

  useEffect(() => {
    preLoadNeighboringPhotos()
  }, [preLoadNeighboringPhotos])

  if (!details) return null

  const photoSrc = getPhotoUrl({
    isThumbnail: false,
    photoSrc: details.src
  })

  return (
    <>
      <OverflowHidden />
      <Modal
        isOpen={selectedPhotoId !== null}
        style={modalCSS}
        onRequestClose={handleCloseModal}
        preventScroll
      >
        <PhotoWrapper>
          <StyledPhoto src={photoSrc} />
        </PhotoWrapper>
        <MetadataAndControlsBottomWrapper>
          <ControlsWrapper>
            <ControlsSectionWrapper>
              <IconButton
                icon="arrowLeft"
                size="LARGE"
                ariaLabel="Previous photo"
                onClick={() => {
                  navigateToNextPhoto('left')
                }}
              />
              <IconButton
                icon="close"
                ariaLabel="Close single photo view"
                onClick={handleCloseModal}
                size="LARGE"
              />
              <IconButton
                icon="arrowRight"
                ariaLabel="Next photo"
                onClick={() => {
                  navigateToNextPhoto('right')
                }}
                size="LARGE"
              />
            </ControlsSectionWrapper>
          </ControlsWrapper>
        </MetadataAndControlsBottomWrapper>
      </Modal>
    </>
  )
}

// Prevent scroll while Modal is open.
const OverflowHidden = createGlobalStyle`
  body {
    overflow: hidden;
  }
`

const modalCSS = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    border: 0,
    padding: 0,
    borderRadius: 0,
    backgroundColor: COLORS.BACKGROUND,
    width: MAX_WIDTH,
    maxWidth: '100vw',
    height: MAX_WIDTH,
    maxHeight: '100vh', // Ensure the modal doesn't exceed the viewport height
    overflow: 'auto' // Allow scrolling if content overflows
  },
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Semi-transparent background
    zIndex: 1000 // Ensure the overlay is above other elements
  }
}

const MetadataAndControlsBottomWrapper = styled.div`
  display: flex;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  justify-content: center;
  box-sizing: border-box;
  align-items: end;
  flex-direction: column;
`

const ControlsSectionWrapper = styled.div<{ hideBackground?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ hideBackground }) =>
    hideBackground
      ? 'transparent'
      : `color-mix(in srgb, ${COLORS.BACKGROUND} 50%, transparent)`};
  padding: ${CONTENT_SPACING.MEDIUM};
  border-radius: ${CONTENT_SPACING.MEDIUM};
  height: 30px;

  > button:first-child {
    margin-right: ${CONTENT_SPACING.SMALL};
  }
  > button:last-child {
    margin-left: ${CONTENT_SPACING.SMALL};
  }
`

const ControlsWrapper = styled.div`
  border-radius: ${CONTENT_SPACING.MEDIUM};
  margin: ${CONTENT_SPACING.MEDIUM};
  justify-content: end;
  display: flex;
  flex-direction: row;
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

export default PhotoModal
