import React, { useContext, useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { Link, useNavigate, useParams } from 'react-router-dom'
import { LazyImage } from 'sharedComponents'
import { CONTENT_SPACING, FONT_SIZES } from 'theme'
import { type PhotoType, type PrivateGallery } from 'types'
import { context } from '../context'
import { getPhotoUrl } from '../utils'

interface Props {
  privateGallery: boolean
}

const getSelectedGalleryPhotoIdsByGalleryId = (
  galleryId: string,
  photos: PhotoType[]
) => {
  return Object.values(photos)
    .filter(photo => photo.galleryIds.includes(galleryId))
    .sort((a, b) => {
      const aDate = new Date(a.dateTaken)
      const bDate = new Date(b.dateTaken)
      return aDate.getTime() - bDate.getTime()
    })
    .map(({ id }) => id)
}

const getSelectedPrivateGalleryPhotoIdsByGalleryId = (
  galleryId: string,
  privateGalleries: Record<string, PrivateGallery>
) => {
  return Object.values(privateGalleries[galleryId].photos)
    .sort((a, b) => {
      const aDate = new Date(a.dateTaken)
      const bDate = new Date(b.dateTaken)
      return aDate.getTime() - bDate.getTime()
    })
    .map(({ id }) => id)
}

const Gallery = ({ privateGallery }: Props) => {
  const { gallerySlug } = useParams<{ gallerySlug: string }>()
  const {
    state: {
      galleries,
      photos,
      selectedGalleryPhotoIds,
      previouslySelectedPhotoId,
      privateGalleries,
      loadedGalleryId
    },
    dispatch
  } = useContext(context)
  const navigate = useNavigate()

  useEffect(() => {
    if (previouslySelectedPhotoId) {
      dispatch({
        type: 'BACK_TO_GALLERY',
        payload: {
          previouslySelectedPhotoId: null
        }
      })
    }
  }, [previouslySelectedPhotoId, dispatch])

  useEffect(() => {
    if (!gallerySlug) {
      navigate('/')
      return
    }

    if (!privateGallery) {
      dispatch({
        type: 'SET_SELECTED_GALLERY_PHOTO_IDS',
        payload: {
          selectedGalleryPhotoIds: getSelectedGalleryPhotoIdsByGalleryId(
            gallerySlug,
            Object.values(photos)
          ),
          loadedGalleryId: gallerySlug
        }
      })
    } else {
      dispatch({
        type: 'SET_SELECTED_GALLERY_PHOTO_IDS',
        payload: {
          selectedGalleryPhotoIds: getSelectedPrivateGalleryPhotoIdsByGalleryId(
            gallerySlug,
            privateGalleries
          ),
          loadedGalleryId: gallerySlug
        }
      })
    }
  }, [
    dispatch,
    gallerySlug,
    photos,
    navigate,
    privateGalleries,
    privateGallery
  ])

  const Photos = useMemo(() => {
    if (
      !selectedGalleryPhotoIds ||
      !gallerySlug ||
      gallerySlug !== loadedGalleryId // prevent race condition where photoIds are ready before gallery is loaded
    ) {
      return null
    }

    return selectedGalleryPhotoIds.map(photoId => {
      const photo = privateGallery
        ? privateGalleries[gallerySlug].photos[photoId]
        : photos[photoId]

      const url = getPhotoUrl({
        isThumbnail: true,
        photoSrc: photo.src,
        privateGalleryId: undefined
      })
      return (
        <Link id={photo.id} to={`/${gallerySlug}/${photoId}`} key={photo.id}>
          <LazyImage url={url} blurHash={photo.blurHash} />
        </Link>
      )
    })
  }, [
    selectedGalleryPhotoIds,
    photos,
    gallerySlug,
    privateGallery,
    privateGalleries,
    loadedGalleryId
  ])

  if (!gallerySlug 
    // Disabled the next line because it was erroring on hitting escape when looking at a photo, not sure why it was there.
    //|| !selectedGalleryPhotoIds
    ) {
    return <p>Something went wrong</p>
  }
  return (
    <>
      <ProjectDescriptionWrapper>
        <Header>
          {privateGallery
            ? privateGalleries[gallerySlug].gallery.title
            : galleries[gallerySlug].title}
        </Header>
      </ProjectDescriptionWrapper>
      <GalleryWrapper>{Photos}</GalleryWrapper>
    </>
  )
}

const ProjectDescriptionWrapper = styled.div`
  margin: ${CONTENT_SPACING.LARGE};
`

const GalleryWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${CONTENT_SPACING.LARGE};
  margin: ${CONTENT_SPACING.LARGE};
`

const Header = styled.h2`
  font-weight: 900;
  margin-bottom: ${CONTENT_SPACING.XXLARGE};
  margin-top: ${CONTENT_SPACING.XLARGE};
  font-size: ${FONT_SIZES.XXLARGE};
`

export default Gallery
