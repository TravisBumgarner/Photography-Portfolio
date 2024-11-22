// import React, { useCallback, useContext, useEffect } from 'react'
// import { FaArrowLeft, FaArrowRight, FaDownload, FaTimes } from 'react-icons/fa'
// import Modal from 'react-modal'
// import { useNavigate, useParams } from 'react-router-dom'
// import styled, { createGlobalStyle, css } from 'styled-components'

// import { context } from '../context'
// import { COLORS, CONTENT_SPACING, FONT_SIZES } from '../theme'
// import { getPhotoUrl } from '../utils'

// interface PhotoProps {
//   privateGallery: boolean
// }

import React from 'react'

const Photo = () => <div>Photo</div>

export default Photo
// const Photo = ({ privateGallery }: PhotoProps) => {
//   const {
//     state: {
//       photos
//       // selectedGalleryPhotoIds
//     },
//     dispatch
//   } = useContext(context)
//   const { gallerySlug, photoSlug } = useParams<{
//     gallerySlug: string
//     photoSlug: string
//   }>()

//   const details = photoSlug ? photos[photoSlug] : null
//   const navigate = useNavigate()

//   useEffect(
//     () => {
//       if (!photoSlug) {
//         navigate('/')
//       }

//       // // On initial load for a url, we need to set the selectedGalleryPhotoIds
//       // if (!selectedGalleryPhotoIds) {
//       //   dispatch({
//       //     type: 'SET_SELECTED_GALLERY_PHOTO_IDS',
//       //     payload: {
//       //       selectedGalleryPhotoIds: Object.values(photos)
//       //         .filter(
//       //           ({ galleryIds }) =>
//       //             gallerySlug && galleryIds.includes(gallerySlug)
//       //         )
//       //         .map(({ id }) => id),
//       //       loadedGalleryId: gallerySlug ?? null
//       //     }
//       //   })
//       // }
//     },
//     [
//       // dispatch,
//       // photoSlug,
//       // photos,
//       // selectedGalleryPhotoIds,
//       // gallerySlug,
//       // navigate
//     ]
//   )

//   const navigateToNextPhoto = useCallback(
//     (direction: 'left' | 'right') => {
//       if (!photoSlug || !selectedGalleryPhotoIds) {
//         navigate('/')
//         return
//       }

//       const index = selectedGalleryPhotoIds.indexOf(photoSlug)

//       let nextIndex: number
//       if (direction === 'left') {
//         if (index === 0) nextIndex = selectedGalleryPhotoIds.length - 1
//         else nextIndex = index - 1
//       } else {
//         if (index === selectedGalleryPhotoIds.length - 1) nextIndex = 0
//         else nextIndex = index + 1
//       }

//       const nextPhotoId = selectedGalleryPhotoIds[nextIndex]

//       // Improve back button so that it goes back to gallery instead of previous photo.
//       navigate(`/${gallerySlug}/${nextPhotoId}`, { replace: true })
//     },
//     [selectedGalleryPhotoIds, photoSlug, gallerySlug, navigate]
//   )

//   const handleKeyPress = useCallback(
//     (event: KeyboardEvent) => {
//       if (event.key === 'ArrowLeft') navigateToNextPhoto('left')
//       if (event.key === 'ArrowRight') navigateToNextPhoto('right')
//     },
//     [navigateToNextPhoto]
//   )

//   const preLoadNeighboringPhotos = useCallback(() => {
//     if (!selectedGalleryPhotoIds || !photoSlug) return

//     const index = selectedGalleryPhotoIds.indexOf(photoSlug)
//     const previousIndex =
//       index === 0 ? selectedGalleryPhotoIds.length - 1 : index - 1
//     const nextIndex =
//       index === selectedGalleryPhotoIds.length - 1 ? 0 : index + 1

//     const previousPhoto = photos[selectedGalleryPhotoIds[previousIndex]]
//     const nextPhoto = photos[selectedGalleryPhotoIds[nextIndex]]

//     if (previousPhoto) {
//       const img = new Image()
//       img.src = getPhotoUrl({
//         isThumbnail: false,
//         privateGalleryId: privateGallery ? gallerySlug : undefined,
//         photoSrc: previousPhoto.src
//       })
//     }

//     if (nextPhoto) {
//       const img = new Image()
//       img.src = getPhotoUrl({
//         isThumbnail: false,
//         privateGalleryId: privateGallery ? gallerySlug : undefined,
//         photoSrc: nextPhoto.src
//       })
//     }
//   }, [selectedGalleryPhotoIds, photoSlug, photos, gallerySlug, privateGallery])

//   useEffect(() => {
//     preLoadNeighboringPhotos()
//   }, [preLoadNeighboringPhotos])

//   const downloadPhoto = () => {
//     if (!details) return

//     const downloadLink = document.createElement('a')
//     downloadLink.href = getPhotoUrl({
//       isThumbnail: false,
//       privateGalleryId: privateGallery ? gallerySlug : undefined,
//       photoSrc: details.src
//     })
//     downloadLink.download = details.src
//     document.body.append(downloadLink)
//     downloadLink.click()
//     document.body.removeChild(downloadLink)
//   }

//   useEffect(() => {
//     window.addEventListener('keydown', handleKeyPress)
//     return () => {
//       window.removeEventListener('keydown', handleKeyPress)
//     }
//   }, [handleKeyPress])

//   const handleReturnToGallery = () => {
//     if (!photoSlug) {
//       navigate('/')
//       return
//     }

//     // dispatch({
//     //   type: 'BACK_TO_GALLERY',
//     //   payload: { previouslySelectedPhotoId: photoSlug }
//     // })
//     navigate(`/${gallerySlug}`)
//   }

//   if (!details) return null

//   return (
//     <>
//       <OverflowHidden />
//       <Modal
//         isOpen={true}
//         style={modalCSS}
//         onRequestClose={handleReturnToGallery}
//       >
//         <PhotoWrapper>
//           <StyledPhoto
//             src={getPhotoUrl({
//               isThumbnail: false,
//               privateGalleryId: privateGallery ? gallerySlug : undefined,
//               photoSrc: details.src
//             })}
//           />
//         </PhotoWrapper>
//         <MetadataAndControlsBottomWrapper>
//           {/* {toggleInfo ? <Metadata details={details} /> : null} */}
//           <ControlsWrapper>
//             <ControlsSectionWrapper hideBackground={!privateGallery}>
//               {privateGallery && (
//                 <DownloadButton
//                   size={FONT_SIZES.LARGE}
//                   onClick={downloadPhoto}
//                 />
//               )}
//             </ControlsSectionWrapper>
//             <ControlsSectionWrapper>
//               <PreviousButton
//                 size={FONT_SIZES.LARGE}
//                 onClick={() => {
//                   navigateToNextPhoto('left')
//                 }}
//               />
//               <CloseIcon
//                 size={FONT_SIZES.LARGE}
//                 onClick={handleReturnToGallery}
//                 style={{
//                   marginLeft: CONTENT_SPACING.LARGE,
//                   marginRight: CONTENT_SPACING.LARGE
//                 }}
//               />
//               <NextButton
//                 size={FONT_SIZES.LARGE}
//                 onClick={() => {
//                   navigateToNextPhoto('right')
//                 }}
//               />
//             </ControlsSectionWrapper>
//           </ControlsWrapper>
//         </MetadataAndControlsBottomWrapper>
//       </Modal>
//     </>
//   )
// }

// const OverflowHidden = createGlobalStyle`
//   body {
//     overflow: hidden;
//   }
// `

// const modalCSS = {
//   content: {
//     top: '50%',
//     left: '50%',
//     right: 'auto',
//     bottom: 'auto',
//     marginRight: '-50%',
//     transform: 'translate(-50%, -50%)',
//     border: 0,
//     width: '100%',
//     height: '100%',
//     padding: CONTENT_SPACING.LARGE
//   }
// }

// const IconCSS = css`
//   fill: ${COLORS.BLACK};
//   cursor: pointer;

//   &:hover {
//     fill: ${COLORS.GREEN};
//   }
// `
// const CloseIcon = styled(FaTimes)`
//   ${IconCSS}
// `
// const PreviousButton = styled(FaArrowLeft)`
//   ${IconCSS}
// `
// const NextButton = styled(FaArrowRight)`
//   ${IconCSS}
// `

// const DownloadButton = styled(FaDownload)`
//   ${IconCSS}
// `

// const MetadataAndControlsBottomWrapper = styled.div`
//   display: flex;
//   position: fixed;
//   bottom: ${CONTENT_SPACING.LARGE};
//   left: ${CONTENT_SPACING.LARGE};
//   right: ${CONTENT_SPACING.LARGE};
//   justify-content: center;
//   box-sizing: border-box;
//   align-items: end;
//   flex-direction: column;
// `

// const ControlsSectionWrapper = styled.div<{ hideBackground?: boolean }>`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   background-color: ${({ hideBackground }) =>
//     hideBackground ? 'transparent' : 'rgba(255, 255, 255, 0.7)'};
//   padding: ${CONTENT_SPACING.MEDIUM};
//   border-radius: ${CONTENT_SPACING.MEDIUM};
//   height: 30px;

//   :first-child {
//     margin-right: ${CONTENT_SPACING.MEDIUM};
//   }
//   :last-child {
//     margin-left: ${CONTENT_SPACING.MEDIUM};
//   }
// `

// const ControlsWrapper = styled.div`
//   border-radius: ${CONTENT_SPACING.MEDIUM};
//   margin: ${CONTENT_SPACING.MEDIUM};
//   justify-content: end;
//   display: flex;
//   flex-direction: row;
// `

// const PhotoWrapper = styled.div`
//   display: flex;
//   justify-content: center;
//   align-items: center;
//   flex-direction: column;
//   width: 100%;
//   height: 100%;
//   box-sizing: border-box;
//   padding: ${CONTENT_SPACING.LARGE};
// `

// const StyledPhoto = styled.img`
//   max-width: 100%;
//   max-height: 100%;
//   object-fit: contain;
//   box-sizing: border-box;
//   aspect-ratio: inherit;
//   user-select: none;
// `

// // const MetadataWrapper = styled.div`
// //   border-radius: 0.5rem;
// //   padding: 0.5rem;
// //   background-color: rgba(255, 255, 255, 0.7);
// //   height: 1.5rem;
// //   display: flex;
// //   justify-content: center;
// //   align-items: center;

// //   & > * {
// //     font-size: 14px;
// //     padding: 0;
// //   }
// // `

// // const Spacer = styled(({ className }) => <span className={className}>||</span>)`
// //   padding: 0 20px;
// //   display: inline-block;
// //   font-weight: 700;
// // `

// // const Metadata = ({ details }: { details: PhotoType }) => {
// //   const {
// //     camera,
// //     aperture,
// //     shutterSpeed,
// //     iso,
// //     lens,
// //     focalLength
// //     // location
// //   } = details

// //   const gearString = `${camera} ${lens}`
// //   const statsString =
// //     aperture || shutterSpeed || iso || focalLength
// //       ? `${aperture} ${shutterSpeed} ${iso} ${focalLength}`
// //       : 'N/A'

// //   return (
// //     <MetadataWrapper>
// //       <Text>
// //         <>
// //           {/* {location} */}
// //           {/* <Spacer /> */}
// //           {gearString}
// //           <Spacer />
// //           {statsString}
// //         </>
// //       </Text>
// //     </MetadataWrapper>
// //   )
// // }

// export default Photo
