import { AnimatePresence, motion, useAnimationControls } from 'framer-motion'
import React, { useCallback, useEffect, useRef } from 'react'
import styled from 'styled-components'

import { useSwipeable } from 'react-swipeable'

import { useNavigate, useParams } from 'react-router-dom'
import Error from 'src/sharedComponents/Error'
import IconButton from 'src/sharedComponents/IconButton'
import NavigationAnimation, {
  SHARED_ANIMATION_DURATION
} from 'src/sharedComponents/NavigationAnimation'
import usePhotoStore from 'src/store'
import { COLORS, CONTENT_SPACING, Z_INDEX } from 'src/theme'
import { getPhotoUrl } from 'src/utils'

const SinglePhoto = () => {
  const selectedPhotoIds = usePhotoStore(state => state.selectedPhotoIds)
  const getPhotoById = usePhotoStore(state => state.getPhotoById)
  const navigate = useNavigate()
  const controls = useAnimationControls()
  const nextPhotoId = useRef<string | null>(null)
  const previousSwipeOutDirection = useRef<'left' | 'right' | null>(null)

  const { gallerySlug, photoSlug } = useParams<{
    gallerySlug: string
    photoSlug: string
  }>()

  const handlers = useSwipeable({
    preventScrollOnSwipe: true,
    onSwipedLeft: () => {
      swipeToNextPhoto('right')
    },
    onSwipedRight: () => {
      swipeToNextPhoto('left')
    },
    trackMouse: true
  })

  useEffect(() => {
    console.log('woo')
    void controls.start('swipeLeftIn')
  }, [controls, photoSlug])

  const details = getPhotoById(photoSlug!)

  const navigateToNextPhoto = useCallback(
    (nextPhotoId: string) => {
      navigate(`/gallery/${gallerySlug}/${nextPhotoId}`)
    },
    [gallerySlug, navigate]
  )

  const handleAnimationComplete = useCallback(
    (name: string) => {
      console.log('name', name)
      if (nextPhotoId.current) navigateToNextPhoto(nextPhotoId.current)
    },
    [navigateToNextPhoto]
  )

  const swipeToNextPhoto = useCallback(
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
      nextPhotoId.current = selectedPhotoIds[nextIndex]

      previousSwipeOutDirection.current = direction
      void controls.start(
        direction === 'left' ? 'swipeLeftOut' : 'swipeRightOut'
      )
    },
    [selectedPhotoIds, navigate, photoSlug, controls]
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
      if (event.key === 'ArrowLeft') swipeToNextPhoto('left')
      if (event.key === 'ArrowRight') swipeToNextPhoto('right')
      if (event.key === 'Escape') returnToGallery()
    },
    [swipeToNextPhoto, returnToGallery]
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
        <Wrapper {...handlers}>
          <PhotoWrapper>
            <AnimatePresence mode="wait">
              <StyledPhoto
                onAnimationComplete={handleAnimationComplete}
                key={photoSrc}
                src={photoSrc}
                animate={controls}
                initial={
                  'swipeLeftIn'
                  // previousSwipeOutDirection.current === 'left'
                  //   ? 'swipeLeftIn'
                  //   : 'swipeRightIn'
                }
                variants={{
                  swipeRightIn: {
                    transform: ['translateX(-100vw)', 'translateX(0px)']
                  },
                  swipeRightOut: {
                    transform: ['translateX(0px)', 'translateX(100vw)']
                  },
                  swipeLeftIn: {
                    transform: ['translateX(100vw)', 'translateX(0px)']
                  },
                  swipeLeftOut: {
                    transform: ['translateX(0px)', 'translateX(-100vw)']
                  }
                }}
                transition={{ duration: 3, ease: 'easeInOut' }}
              />
            </AnimatePresence>
          </PhotoWrapper>
        </Wrapper>
        <ControlsWrapper
          // The app background and this background animate at different times so we add a delay so that it isn't noticed.
          initial={{ backgroundColor: 'transparent' }}
          animate={{
            backgroundColor: ` color-mix(in srgb, ${COLORS.FOREGROUND} 50%, transparent)`
          }}
          exit={{ backgroundColor: 'transparent' }}
          transition={{ duration: SHARED_ANIMATION_DURATION, delay: 0.5 }}
        >
          <IconButton
            color={COLORS.BACKGROUND}
            icon="arrowLeft"
            size="LARGE"
            ariaLabel="Previous photo"
            onClick={() => {
              swipeToNextPhoto('left')
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
              swipeToNextPhoto('right')
            }}
            size="LARGE"
          />
        </ControlsWrapper>
      </NavigationAnimation>
    </>
  )
}

const Wrapper = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  right: 0;
  overflow: hidden;
  z-index: ${Z_INDEX.SINGLE_PHOTO};
`

const ControlsWrapper = styled(motion.div)`
  position: fixed;
  right: 0;
  bottom: 0;
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

const StyledPhoto = styled(motion.img)`
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  box-sizing: border-box;
  aspect-ratio: inherit;
  user-select: none;
`

export default SinglePhoto
