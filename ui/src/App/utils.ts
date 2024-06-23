import { PhotoType } from "types"

export const getPhotoUrl = ({ isThumbnail, privateGalleryId, photoSrc }: { isThumbnail: boolean, privateGalleryId?: string, photoSrc: string }) => {

  let url = 'https://storage.googleapis.com/photo21-asdqwd/photos/'
  if (privateGalleryId) {
    url += `${privateGalleryId}/`
  }

  url += isThumbnail ? 'thumbnail/' : 'large/'
  url += encodeURIComponent(photoSrc)
  return url
}


