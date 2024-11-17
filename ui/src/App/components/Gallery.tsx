import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import styled from 'styled-components'

import { Link, useNavigate, useParams } from 'react-router-dom'
import { LazyImage } from 'sharedComponents'
import { CONTENT_SPACING, FONT_SIZES } from 'theme'
import { type PhotoType, type PrivateGallery } from 'types'
import { context } from '../context'
import { getPhotoUrl, useEffectDebugger } from '../utils'

const PreviewPhoto = ({
  photoId,
  gallerySlug,
  privateGallery
}: {
  photoId: string
  gallerySlug: string
  privateGallery: boolean
}) => {
  const {
    state: { photos, privateGalleries }
  } = useContext(context)

  const { id, blurHash, src } = useMemo(() => {
    return privateGallery
      ? privateGalleries[gallerySlug].photos[photoId]
      : photos[photoId]
  }, [photoId, photos, privateGalleries, gallerySlug, privateGallery])

  const url = getPhotoUrl({
    isThumbnail: true,
    photoSrc: src,
    privateGalleryId: undefined
  })

  return (
    <Link id={photoId} to={`/${gallerySlug}/${photoId}`} key={id}>
      <LazyImage url={url} blurHash={blurHash} />
    </Link>
  )
}

interface Props {
  privateGallery: boolean
}

const getPhotoIdsByGalleryId = (galleryId: string, photos: PhotoType[]) => {
  return Object.values(photos)
    .filter(photo => photo.galleryIds.includes(galleryId))
    .sort((a, b) => {
      const aDate = new Date(a.dateTaken)
      const bDate = new Date(b.dateTaken)
      return aDate.getTime() - bDate.getTime()
    })
    .map(({ id }) => id)
}

const getPhotoIdsByByPrivateGalleryId = (
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
  const [photoIds, setPhotoIds] = useState<string[]>([])

  const { gallerySlug } = useParams<{ gallerySlug: string }>()
  const {
    state: { galleries, photos, previouslySelectedPhotoId, privateGalleries },
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

  const getPhotoIds = useCallback(() => {
    // Function is not called if gallerySlug is undefined.
    if (!privateGallery) {
      return getPhotoIdsByGalleryId(gallerySlug!, Object.values(photos))
    } else {
      return getPhotoIdsByByPrivateGalleryId(gallerySlug!, privateGalleries)
    }
  }, [gallerySlug, photos, privateGallery, privateGalleries])

  useEffectDebugger(() => {
    if (!gallerySlug) {
      console.log('returning home.')
      navigate('/')
      return
    }

    // Note - the length check might not be correct. It is assumed this is how to make this more performant.
    if (photoIds.length > 0) {
      return
    }
    console.log('why am I getting called.')
    setPhotoIds(getPhotoIds())
  }, [gallerySlug, photoIds.length, navigate, getPhotoIds])

  if (
    !gallerySlug
    // Disabled the next line because it was erroring on hitting escape when looking at a photo, not sure why it was there.
    // || !selectedGalleryPhotoIds
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
      <GalleryWrapper>
        {photoIds?.map(photoId => (
          <PreviewPhoto
            gallerySlug={gallerySlug}
            photoId={photoId}
            privateGallery={privateGallery}
            key={photoId}
          />
        ))}
      </GalleryWrapper>
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
