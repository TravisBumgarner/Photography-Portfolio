import { v5 as uuidv5 } from 'uuid'

// Stable IDs derived from the filename so re-running the pipeline never
// changes a photo's ID. Must not change or every existing ID breaks.
const PHOTOS_NAMESPACE = 'deadbeef-beef-491e-99b0-da01ff1f3341'

export const generatePhotoId = (filename: string) => {
  return uuidv5(filename, PHOTOS_NAMESPACE)
}
