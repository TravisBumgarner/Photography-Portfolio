import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import getData from './content'
import { type GalleryType, type PhotoType } from './types'

export interface State {
  photos: Record<string, PhotoType>
  galleries: Record<string, GalleryType>
  selectedPhotoIds: string[]
  setPhotos: (photos: Record<string, PhotoType>) => void
  setGalleries: (galleries: Record<string, GalleryType>) => void
  setSelectedPhotoIds: (galleryId: string | undefined) => void
  getPhotoById: (photoId: string | null) => PhotoType | undefined
}

const initialData = getData()

const usePhotoStore = create<State>()(
  devtools(
    persist(
      (set, get) => ({
        photos: initialData.photos,
        galleries: initialData.galleries,
        selectedPhotoIds: [],
        getPhotoById: (photoId: string) => {
          return get().photos[photoId]
        },
        setPhotos: photos => {
          set({ photos })
        },
        setGalleries: galleries => {
          set({ galleries })
        },
        setSelectedPhotoIds: (galleryId?: string) => {
          const selectedPhotoIds = Object.values(get().photos)
            .filter(photo => photo.galleryIds.includes(galleryId ?? ''))
            .sort((a, b) => {
              const aDate = new Date(a.dateTaken)
              const bDate = new Date(b.dateTaken)
              return aDate.getTime() - bDate.getTime()
            })
            .map(({ id }) => id)

          set({ selectedPhotoIds })
        }
      }),
      {
        name: 'photo-store'
      }
    )
  )
)

export default usePhotoStore
