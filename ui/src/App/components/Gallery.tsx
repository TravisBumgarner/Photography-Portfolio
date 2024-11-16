import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'

import { Link, useNavigate, useParams } from 'react-router-dom'
import { Header, LazyImage } from 'sharedComponents'
import { type PhotoType, type PrivateGallery } from 'types'
import { context } from '../context'
import { getPhotoUrl } from '../utils'

interface Props {
  privateGallery: boolean
}

const getSelectedGalleryPhotoIdsByGalleryId = (galleryId: string, photos: PhotoType[]) => {
  return Object.values(photos)
    .filter(photo => photo.galleryIds.includes(galleryId))
    .sort((a, b) => {
      const aDate = new Date(a.dateTaken)
      const bDate = new Date(b.dateTaken)
      return aDate.getTime() - bDate.getTime()
    })
    .map(({ id }) => id)
}

const getSelectedPrivateGalleryPhotoIdsByGalleryId = (galleryId: string, privateGalleries: Record<string, PrivateGallery>) => {
  return Object.values(privateGalleries[galleryId].photos).sort((a, b) => {
    const aDate = new Date(a.dateTaken)
    const bDate = new Date(b.dateTaken)
    return aDate.getTime() - bDate.getTime()
  })
  .map(({ id }) => id)
}

const Gallery = ({ privateGallery }: Props) => {
  const { gallerySlug } = useParams<{ gallerySlug: string }>()
  const { state: { galleries, photos, selectedGalleryPhotoIds, previouslySelectedPhotoId, privateGalleries, loadedGalleryId }, dispatch } = useContext(context)
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
          selectedGalleryPhotoIds: getSelectedGalleryPhotoIdsByGalleryId(gallerySlug, Object.values(photos)),
          loadedGalleryId: gallerySlug
        }
      })
    } else {
      dispatch({
        type: 'SET_SELECTED_GALLERY_PHOTO_IDS',
        payload: {
          selectedGalleryPhotoIds: getSelectedPrivateGalleryPhotoIdsByGalleryId(gallerySlug, privateGalleries),
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
    ) return null

    return selectedGalleryPhotoIds.map((photoId) => {
      const photo = privateGallery ? privateGalleries[gallerySlug].photos[photoId] : photos[photoId]

      const url = getPhotoUrl({ isThumbnail: true, photoSrc: photo.src, privateGalleryId: undefined })
      return (
        <Link id={photo.id} to={`/${gallerySlug}/${photoId}`} key={photo.id}>
          <LazyImage url={url} blurHash={"REPLAC_ME"} />
        </Link>
      )
    }
    )
  }, [selectedGalleryPhotoIds, photos, gallerySlug, privateGallery, privateGalleries, loadedGalleryId])

  if (!gallerySlug || !selectedGalleryPhotoIds) return <p>Something went wrong</p>
  console.log(selectedGalleryPhotoIds, gallerySlug)
  return (
    <>
      <ProjectDescriptionWrapper>
        <Header size="medium">{privateGallery ? privateGalleries[gallerySlug].gallery.title : galleries[gallerySlug].title}</Header>
      </ProjectDescriptionWrapper>
      <GalleryWrapper>{Photos}</GalleryWrapper>
    </>
  )
}

const ProjectDescriptionWrapper = styled.div`
    margin: 1rem;
`


const GalleryWrapper = styled.div`
display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin: 1rem;
`

export default Gallery
