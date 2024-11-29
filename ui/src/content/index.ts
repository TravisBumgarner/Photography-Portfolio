import { type GalleryType, type PhotoType } from 'src/types'
import output from './output.json'

interface Data {
  photos: Record<string, PhotoType>
  galleries: Record<string, GalleryType>
}

const getData = (): Data => {
  return {
    photos: output.photos,
    galleries: output.galleries
  }
}

export default getData
