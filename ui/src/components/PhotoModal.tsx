import React, { useCallback, useContext, useEffect } from 'react'
import Modal from 'react-modal'
import styled, { createGlobalStyle } from 'styled-components'

import { context } from 'src/context'
import usePreventAppScroll from 'src/hooks/usePreventAppScroll'
import { IconButton } from 'src/sharedComponents'
import { COLORS, CONTENT_SPACING, MAX_WIDTH } from 'src/theme'
import { getPhotoUrl } from 'src/utils'

interface PhotoProps {
  navigateToNextPhoto: (direction: 'left' | 'right') => void
  privateGallery: boolean
  closeModal: () => void
  selectedPhotoId: string | null
}

const PhotoModal = ({
  navigateToNextPhoto,
  privateGallery,
  closeModal,
  selectedPhotoId
}: PhotoProps) => {
  const {
    state: { photos }
  } = useContext(context)
  usePreventAppScroll(selectedPhotoId !== null)

  const details = selectedPhotoId ? photos[selectedPhotoId] : null

  const downloadPhoto = () => {
    if (!details || !selectedPhotoId) return

    const downloadLink = document.createElement('a')
    downloadLink.href = getPhotoUrl({
      isThumbnail: false,
      privateGalleryId: privateGallery ? selectedPhotoId : undefined,
      photoSrc: details.src
    })
    downloadLink.download = details.src
    document.body.append(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
  }

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

  if (!details) return null

  const photoSrc = getPhotoUrl({
    isThumbnail: false,
    privateGalleryId: privateGallery ? selectedPhotoId : undefined,
    photoSrc: details.src
  })

  return (
    <>
      <OverflowHidden />
      <Modal
        isOpen={selectedPhotoId !== null}
        style={modalCSS}
        onRequestClose={closeModal}
        preventScroll
      >
        <PhotoWrapper>
          <StyledPhoto src={photoSrc} />
        </PhotoWrapper>
        <MetadataAndControlsBottomWrapper>
          <ControlsWrapper>
            <ControlsSectionWrapper hideBackground={!privateGallery}>
              {privateGallery && (
                <IconButton
                  icon="download"
                  size="LARGE"
                  ariaLabel="Previous photo"
                  onClick={downloadPhoto}
                />
              )}
            </ControlsSectionWrapper>
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
                onClick={closeModal}
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
