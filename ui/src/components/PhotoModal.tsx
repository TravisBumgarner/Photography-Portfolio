import React, { useCallback, useContext, useEffect } from 'react'
import { FaArrowLeft, FaArrowRight, FaDownload, FaTimes } from 'react-icons/fa'
import Modal from 'react-modal'
import styled, { createGlobalStyle, css } from 'styled-components'

import { context } from '../context'
import { COLORS, CONTENT_SPACING, FONT_SIZES } from '../theme'
import { getPhotoUrl } from '../utils'

interface PhotoProps {
  navigateToNextPhoto: (direction: 'left' | 'right') => void
  privateGallery: boolean
  closeModal: () => void
  isOpen: boolean
  selectedPhotoId: string | null
}

const PhotoModal = ({
  navigateToNextPhoto,
  privateGallery,
  closeModal,
  isOpen,
  selectedPhotoId
}: PhotoProps) => {
  const {
    state: { photos }
  } = useContext(context)
  // const { gallerySlug, photoSlug } = useParams<{
  //   gallerySlug: string
  //   photoSlug: string
  // }>()

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
      <Modal isOpen={true} style={modalCSS} onRequestClose={closeModal}>
        <PhotoWrapper>
          <StyledPhoto src={photoSrc} />
        </PhotoWrapper>
        <MetadataAndControlsBottomWrapper>
          <ControlsWrapper>
            <ControlsSectionWrapper hideBackground={!privateGallery}>
              {privateGallery && (
                <DownloadButton
                  size={FONT_SIZES.LARGE}
                  onClick={downloadPhoto}
                />
              )}
            </ControlsSectionWrapper>
            <ControlsSectionWrapper>
              <PreviousButton
                size={FONT_SIZES.LARGE}
                onClick={() => {
                  navigateToNextPhoto('left')
                }}
              />
              <CloseIcon
                size={FONT_SIZES.LARGE}
                onClick={closeModal}
                style={{
                  marginLeft: CONTENT_SPACING.LARGE,
                  marginRight: CONTENT_SPACING.LARGE
                }}
              />
              <NextButton
                size={FONT_SIZES.LARGE}
                onClick={() => {
                  navigateToNextPhoto('right')
                }}
              />
            </ControlsSectionWrapper>
          </ControlsWrapper>
        </MetadataAndControlsBottomWrapper>
      </Modal>
    </>
  )
}

const OverflowHidden = createGlobalStyle`
  body {
    overflow: hidden;
  }
`

const modalCSS = {
  content: {
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    border: 0,
    padding: 0,
    backgroundColor: '#ffffff',
    width: '100%',
    height: '100%'
  }
}

const IconCSS = css`
  fill: ${COLORS.BLACK};
  cursor: pointer;

  &:hover {
    fill: ${COLORS.GREEN};
  }
`
const CloseIcon = styled(FaTimes)`
  ${IconCSS}
`
const PreviousButton = styled(FaArrowLeft)`
  ${IconCSS}
`
const NextButton = styled(FaArrowRight)`
  ${IconCSS}
`

const DownloadButton = styled(FaDownload)`
  ${IconCSS}
`

const MetadataAndControlsBottomWrapper = styled.div`
  display: flex;
  position: fixed;
  bottom: ${CONTENT_SPACING.LARGE};
  left: ${CONTENT_SPACING.LARGE};
  right: ${CONTENT_SPACING.LARGE};
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
    hideBackground ? 'transparent' : 'rgba(255, 255, 255, 0.7)'};
  padding: ${CONTENT_SPACING.MEDIUM};
  border-radius: ${CONTENT_SPACING.MEDIUM};
  height: 30px;

  :first-child {
    margin-right: ${CONTENT_SPACING.MEDIUM};
  }
  :last-child {
    margin-left: ${CONTENT_SPACING.MEDIUM};
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
