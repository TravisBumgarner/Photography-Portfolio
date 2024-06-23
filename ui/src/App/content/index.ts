import { type GalleryType, type PhotoType, type PrivateGallery } from 'types'
import output from './output.json'
import rickyAndTif from './ricky-and-tif.json'

interface Data {
  photos: Record<string, PhotoType>
  galleries: Record<string, GalleryType>
  backgroundPhotos: PhotoType[]
  privateGalleries: Record<string, PrivateGallery>
}

const getData = (): Data => {
  const backgroundPhotos: PhotoType[] = Object.values(output.photos).filter(
    ({ isBackgroundPhoto }) => isBackgroundPhoto
  )

  return {
    photos: output.photos,
    galleries: output.galleries,
    backgroundPhotos,
    privateGalleries: {
      'ricky-and-tif': rickyAndTif
    }
  }
}

export default getData
