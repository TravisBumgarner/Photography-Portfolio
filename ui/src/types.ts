export interface GalleryType {
  title: string
  slug: string
  previewSrc: string
  previewId: string
}

export interface PhotoType {
  id: string
  src: string
  galleryIds: string[]
  dateTaken: string
  blurHash: string
  width: number
  height: number
}
