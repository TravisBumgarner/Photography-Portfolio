import { type GalleryType, type PhotoType, type PrivateGallery } from 'types'
import output from './output.json'
// import rickyAndTif from './ricky-and-tif.json'

interface Data {
  photos: Record<string, PhotoType>
  galleries: Record<string, GalleryType>
  privateGalleries: Record<string, PrivateGallery>
}

// Todo - this whole file can be improved.

const getData = (): Data => {
  return {
    photos: output.photos,
    galleries: output.galleries,
    privateGalleries: {
      // 'ricky-and-tif': rickyAndTif
    }
  }
}

const getSelectedGalleryPhotoIdsByGalleryId = (galleryId: string) => {
  return Object.values(getData().photos)
    .filter(photo => photo.galleryIds.includes(galleryId))
    .sort((a, b) => {
      const aDate = new Date(a.dateTaken)
      const bDate = new Date(b.dateTaken)
      return aDate.getTime() - bDate.getTime()
    })
    .map(({ id }) => id)
}

const getSelectedPrivateGalleryPhotoIdsByGalleryId = (galleryId: string) => {
  return Object.values(getData().privateGalleries[galleryId].photos)
    .sort((a, b) => {
      const aDate = new Date(a.dateTaken)
      const bDate = new Date(b.dateTaken)
      return aDate.getTime() - bDate.getTime()
    })
    .map(({ id }) => id)
}

export {
  getData,
  getSelectedGalleryPhotoIdsByGalleryId,
  getSelectedPrivateGalleryPhotoIdsByGalleryId
}
