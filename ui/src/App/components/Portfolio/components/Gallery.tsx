import React, { useContext, useEffect, useMemo } from 'react'
import styled from 'styled-components'

import { Link, useNavigate, useParams } from 'react-router-dom'
import { Header } from 'sharedComponents'
import { type PhotoType } from 'types'
import { context } from '../../../context'
import { getPhotoUrl } from '../../../utils'

interface Props {
  privateGallery: boolean
}

const getSelectedGalleryPhotoIdsByGalleryId = (galleryId: string, photos: PhotoType[]) => {
  return Object.values(photos)
    .filter(photo => photo.gallery == galleryId)
    .sort((a, b) => {
      const aDate = new Date(a.dateTaken)
      const bDate = new Date(b.dateTaken)
      return bDate.getTime() - aDate.getTime()
    })
    .map(({ id }) => id)
}

const Gallery = ({ privateGallery }: Props) => {
  const { gallerySlug } = useParams<{ gallerySlug: string }>()
  const { state: { galleries, photos, selectedGalleryPhotoIds }, dispatch } = useContext(context)
  const navigate = useNavigate()

  useEffect(() => {
    if (!gallerySlug) {
      navigate('/')
      return
    }

    dispatch({
      type: 'SET_SELECTED_GALLERY_PHOTO_IDS',
      payload: {
        selectedGalleryPhotoIds: getSelectedGalleryPhotoIdsByGalleryId(gallerySlug, Object.values(photos))
      }
    })
  }, [
    dispatch,
    gallerySlug,
    photos,
    navigate
  ])

  const Photos = useMemo(() => {
    if (!selectedGalleryPhotoIds || !gallerySlug) return null

    return selectedGalleryPhotoIds.map((photoId) => {
      const photo = photos[photoId]

      const url = getPhotoUrl({ isThumbnail: true, photoSrc: photo.src, privateGalleryId: privateGallery ? photo.gallery : undefined })
      return (
        <Link to={`/${gallerySlug}/${photoId}`} key={photo.id}>
          <Image id={photo.id} style={{ backgroundImage: `url(${url})` }} />
        </Link>
      )
    }
    )
  }, [selectedGalleryPhotoIds, photos, gallerySlug, privateGallery])

  if (!gallerySlug || !selectedGalleryPhotoIds) return <p>Something went wrong</p>

  return (
    <>
      <ProjectDescriptionWrapper>
        <Header size="medium">{galleries[gallerySlug].title}</Header>
      </ProjectDescriptionWrapper>
      <GalleryWrapper>{Photos}</GalleryWrapper>
    </>
  )
}

const ProjectDescriptionWrapper = styled.div`
    margin: 1rem;
`

const Image = styled.div`
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    width: 100%;
    padding-bottom: 100%;
    cursor: pointer;
`

const GalleryWrapper = styled.div`
display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    margin: 1rem;
`

export default Gallery
