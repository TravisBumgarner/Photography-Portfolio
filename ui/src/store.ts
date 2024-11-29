import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import getData from './content'
import { type GalleryType, type PhotoType } from './types'

export interface State {
  photos: Record<string, PhotoType>
  galleries: Record<string, GalleryType>
  selectedPhotoId: string | null
  selectedPhotoIds: string[]
  setSelectedPhotoId: (selectedPhotoId: string | null) => void
  setPhotos: (photos: Record<string, PhotoType>) => void
  setGalleries: (galleries: Record<string, GalleryType>) => void
  setSelectedPhotoIds: (galleryId: string | undefined) => void
}

const initialData = getData()

const usePhotoStore = create<State>()(
  devtools(
    persist(
      (set, get) => ({
        photos: initialData.photos,
        galleries: initialData.galleries,
        selectedPhotoId: null,
        selectedPhotoIds: [],
        setPhotos: photos => {
          set({ photos })
        },
        setGalleries: galleries => {
          set({ galleries })
        },
        setSelectedPhotoId: selectedPhotoId => {
          set({ selectedPhotoId })
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
